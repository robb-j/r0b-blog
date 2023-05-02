/**
  It ermm ... adds two numbers together
  
  ```js
  import { add } from "my-api"
  
  const answer = add(40, 2);
  ```
  
  @param {number} a The first number to add
  @param {number} b The number to add to the first number
  @returns {number} The sum of the two arguments
*/
export function add(a, b) {
  return a + b
}

/**
  Greet the nice person by their name
  
  ```js
  import { greet } from "my-api"
  
  const message = greet('Geoff Testington')
  ```
  
  @param {string} name The name of the person to greet
  @returns {string} The boring greeting message
 */
export function hello(name = 'General Kenobi') {
  return `Hello there, ${name}`
}
