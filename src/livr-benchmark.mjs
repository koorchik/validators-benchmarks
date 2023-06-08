import Benchmark from "benchmark";
import LIVR from 'livr';
import Joi from 'joi';
import JsonSchema from 'jsonschema';

const livrValidator = new LIVR.Validator({
  username: 'required',
  email: ['required', 'email'],
  gender: { one_of: ['male', 'female'] },
  phone: { max_length: 10 },
  password: ['required', { min_length: 10 }],
  password2: { equal_to_field: 'password' }
});

livrValidator.prepare();

const joiValidator = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  gender: Joi.string().valid('male', 'female'),
  phone: Joi.string().max(10),
  password: Joi.string().min(10).required(),
  password2: Joi.ref('password'),
});


const jsonSchemaValidator = new JsonSchema.Validator();
const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "minLength": 1
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "gender": {
      "type": "string",
      "enum": ["male", "female"]
    },
    "phone": {
      "type": "string",
      "pattern": "^[+][0-9]+$"
    },
    "password": {
      "type": "string",
      "minLength": 8
    },
    "password2": {
      "type": "string",
      "minLength": 8
    }
  },
  "required": ["username", "email", "password"],
  "additionalProperties": false
};

const formData = {
  username: 'john',
  email: 'john@mail.com',
  gender: 'male',
  phone: '+22221212',
  password: 'mypassword1',
  password2: 'mypassword1'
};

var suite = new Benchmark.Suite;

// add tests
suite
  .add('LIVR', function () {
    livrValidator.validate(formData);
  })
  .add('Joi', function () {
    joiValidator.validate(formData);
  })
  .add('JSON Schema', function () {
    jsonSchemaValidator.validate(formData, schema)
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ 'async': false });