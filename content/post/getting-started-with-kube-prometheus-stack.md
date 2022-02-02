---
title: Getting started with kube-prometheus-stack
date: 2022-02-02
draft: true
summary: >
  I recently added monitoring and alerting to my Kubernetes stack to discover and respond to failures faster.
  It took me way too long so here's what I did and learned.
---

I recently added monitoring and alerting to my Kubernetes stack to discover and respond to failures faster.
It took me a lot longer to get my head around `kube-prometheus-stack` and get it doing what I wanted it to,
so here's what I found out.

## Background

I've spent the last year building and running infrastructure to host virtual conferences
([Climate:Red](https://climate.red), [MozFest '21 & '22](https://schedule.mozillafestival.org/plaza) & [Planet:Red](https://planetredsummit.com/atrium)).
Running these large deployments by myself has led to a lot of automation.
I start off automating testing and integration,
then building and releasing containers
and also deployment, configuration and scaling of those containers.

I'd previously used [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
to see what was going on inside my Kubernetes clusters,
but always knew these was a lot more to it than the fancy Grafana graphs.
For MozFest 2022 I decided it was time to look into this properly.

The conference infrastructure relies on several background tasks, running as Kubernetes `CronJob` resources,
which if they failed it wasn't quick to find out.
If one of the jobs failed, the schedule might become stale or new users might not be able to sign in.
I needed something to quickly surface those background errors and report them.

## Setup

**kube-promethus-stack** is pretty easy to get installed,
DigitalOcean even offers a one-click install after deploying a Kubernetes cluster!
That internally uses Helm to deploy [prometheus-community/kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack). So you can:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack
```

This deploys [prometheus-operator/kube-prometheus](https://prometheus-operator.dev),
which is an [operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that uses [CRDs](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/) to deploy and configure instances of Prometheus and Alertmanager.
It deploys a standard instance of Prometheus and Alertmanager and adds a tonne of rules for monitoring standard Kubernetes resources.

> One confusion point was that internally kube-prometheus-stack is deployed using [Jsonnet templates](https://jsonnet.org)
> and the helm offering is community-operated, so there are some differences between both sets of documentation.

## How it works

Prometheus is a time series database which periodically scrapes different servers to fetch metrics.
It offers a query language, [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/),
to query those metrics over time and a rule system that triggers alerts based on queries.
Alerts have a name and key-value labels of information about them,
like the `namespace` the resource was in or name of the related `container`.

Alertmanager takes Prometheus' alerts and lets you group and filter them based on the associated labels.
It provides routing to send different alerts to different receivers, like an email or Slack message.

## Configuring Alertmanager

The default Prometheus instance is already configured to collect metrics on Kubernetes resources and alert on failures.
I was interested in `KubeJobFailed` and `KubePodCrashLooping` to detect failed jobs or bad deployments.
We need to configure Alertmanager to setup a receiver to send them somewhere.
`prometheus-operator` provides the _AlertmanagerConfig_ custom resource to do just that.

The default Alertmanager instance is configured to automatically regenerate it's internal configuration
whenever any `AlertmanagerConfig` is changed in any namespace.
So you can create a `custom-alertmanagerconfig.yml` and `kubectl apply -f` -it:

```yaml
apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: mozfest-smtp
  namespace: production
spec:
  route:
    groupBy: ['job']
    groupWait: 30s
    groupInterval: 5m
    repeatInterval: 12h
    receiver: 'sendgrid-smtp'
    matchers:
      - key: severity
        value: warning

  receivers:
    - name: 'sendgrid-smtp'
      emailConfigs:
        - to: notify@example.com
          from: noreply@example.com
          smarthost: smtp.sendgrid.net:587
          authUsername: apikey
          authPassword:
            name: sendgrid-alerts
            key: SENDGRID_API_KEY
```

> It's worth pointing out AlertmanagerConfig is a `v1alpha1` so it will most likely change in the future.

This configuration is a camel-case version of regular [Alertmanager config](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
and the operator merges them together into one configuration.
This creates a `route` that groups jobs by their `job` label and sends them to the `sendgrid-smtp` receiver.
You can use `matchers` to filter the alerts the route receives based on their labels.

There is a bit of hidden logic in how `prometheus-operator` merges these configurations back together.
First it will ignore any `namespace` matchers you set
and instead add a namespace matcher from the namespace the AlertmanagerConfig itself is in.
In this case it would be `namespace=production`,
so make sure to put the config in the same namespace you want alerts from.

Receivers configure how to actually send alerts, in this example via smtp.
This one will email alerts to `notify@example.com` via SendGrid's smtp server.
It references a secret, which needs to be in the same namespace as the AlertmanagerConfig, to specify the password.
So you don't have to put credentials in your CRD.

## Debugging

**Detecting errors**

First, you want to make sure the operator is accepting accepting your AlertmanagerConfig.
It will log any errors it finds parsing the config or let you know that it successfully reload.
You can watch those logs:

```bash
kubectl logs -f -n kube-prometheus-stack deploy/kube-prometheus-stack-operator
```

<br>

**Inspecting generated config**

If the configuration is loading correctly,
you can inspect the generated secret that it is stored in:

```bash
kubectl get secret \
  -n kube-prometheus-stack \
  -o=jsonpath="{.data.alertmanager\.yaml}" \
  alertmanager-kube-prometheus-stack-alertmanager-generated \
    | base64 -d
```

<br>

**Configuration options**

If you're unsure about what you can put into an AlertmanagerConfig,
[doc.crds.dev](https://doc.crds.dev) is a great website that describes CRDs based on their schema.

[doc.crds.dev/github.com/prometheus-operator/prometheus-operator →](https://doc.crds.dev/github.com/prometheus-operator/prometheus-operator)

<br>

**Inspecting prometheus & alertmanager**

You can `port-forward` Prometheus and Alertmanager to see what is going on in a browser.
Looking at Prometheus is useful to explore the default alerts and their generated labels and also inspect the raw metrics.
Looking at Alertmanager lets you see the grouping that is applied and the [alerts](http://localhost:9090/alerts) that have been triggered.

```bash
# Inspect prometheus
kubectl -n kube-prometheus-stack port-forward svc/prometheus-operated 9090:9090
open http://localhost:9090

# Inspect alertmanager
kubectl -n kube-prometheus-stack port-forward svc/alertmanager-operated 9093:9093
open http://localhost:9093
```

## Testing

To make sure alerting is setup, create an obviously bad workload and see if it triggers an alert.
e.g. this `deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bad-app
  namespace: production
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: bad-app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: bad-app
    spec:
      containers:
        - name: bad-app
          image: busybox
          command: ['exit', '1']
```

After you `kubectl apply -f` it, you should first see a "Pending" alert in [Prometheus](http://localhost:9090)
After the `for` duration has passed, it should fire the alert.
Once fired, you should see the new alert in [Alertmanager](http://localhost:9093)
and you should receive it in whatever receiver(s) you have setup.

## Next steps

**Choosing rules** is the next logical step. This setup will alert on all of _kube-prometheus-stack_'s default alerts, which are a good first step. But if thats too much info, you need to find the alerts that are useful to your specific stack. Looking through prometheus's default alerts should be a good first step, i.e. [localhost:9090/alerts](http://localhost:9090/alerts).

**Meta alerting** is useful to ensure confidence that monitoring and alerting is all going as expected. Prometheus constantly fires a `Watchdog` alert so you could use a [dead-man's-switch](https://en.wikipedia.org/wiki/Dead_man%27s_switch) type service that alerts you when the alert stops firing.

**Different receivers** let you send different notifications to different places, perhaps based on severity or the team responsible. You could think about having for frontend or backend teams for example.

**Setup persistence**, the default `kube-prometheus-stack` doesn't persist any metrics beyond a reboot. For alerting purposes this is fine but if you need to keep those metrics around you'll want to look into configuring some [PersistentVolumeClaims](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/README.md#persistent-volumes).

**Custom metrics** is a very interesting next step. You'll need to tell your Prometheus instance to start scraping your services or pods directly using a `ServiceMonitor` or `PodMonitor` and define custom `/metrics` endpoints on your containers that expose [prometheus metrics](https://prometheus.io/docs/concepts/metric_types/) specific to your stack. For MozFest there is a 'site-visitors' widget and it could be interesting to track that over time and maybe create a custom alert when it is over a certain value.

## Resources

These were helpful links I used while getting this setup:

- [prometheus-operator.dev](https://prometheus-operator.dev)
  provides a relatively good overview of whats going on, but does miss out on some of the nuances that go on behind the scenes.
  The [design](https://prometheus-operator.dev/docs/operator/design/) page is a very good starting point explaining what each CRD is for.
  The [user-guides](https://github.com/prometheus-operator/prometheus-operator/tree/main/Documentation/user-guides)
  section in their GitHub repo has some good guides for getting started and configuration.
- [doc.crds.dev](https://doc.crds.dev/github.com/prometheus-operator/prometheus-operator)
  was really helpful debugging what needs to go inside the AlertmanagerConfig resource
  and the descriptions helped to describe what different fields do and how they operate together.
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/)
  is useful to know what should and shouldn't be going into those configs
  and debugging what the generated configurations do.
  The **visual editor** was kind of useful, but not very.
- The [Artifact Hub page](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack)
  has some useful information on it too.

## Conclusion

These were the steps I ended up with to get notifications when things start going wrong inside my Kubernetes cluster.
It helpfully surfaces things that are going wrong and lets you know about them.
If you found this helpful or have questions, let me know on [Twitter](https://twitter.com/robbb_j)!
