# nodezoo-search

A microservice that provides search for MuZoo. This microservice requires an
instance of elastic-search running in order to correctly function. If elastic-search
cannot be reached the service will self terminate.

## Running

To run simply use npm:

```
npm install
npm run start
```

## Configuration

### Running Elastic
A running instance of elastic search is required to use this service. Assuming you
have docker installed.

  - Start your docker machine if required
  - Run `eval $(docker-machine env default)` to enable docker in your shell.
  - Run `docker-compose -f test/elastic.yml up` to start elastic

Please note, you need to pass the host ip of your docker-machine
if you are on an OS other than linux, obtain with `docker-machine ip default`.

### Environment Variables
Various settings can be changed using environment variables, see the list below for
all available variable names.


#### SEARCH_HOST
  - The host to listen on.
  - Defaults to `localhost`

#### SEARCH_PORT
  - The port to listen on.
  - Defaults to `6040`.

#### SEARCH_ELASTIC_HOST
  - The host elastic will listen on.
  - Defaults to `localhost`

#### SEARCH_ELASTIC_PORT
  - The port elastic will listen on.
  - Defaults to `9200` .


## Messages Handled
This micro-service handles the following messages:

### `role:search, cmd:upsert`
Adds or inserts a record into elastic search

```js
mu.dispatch({role: 'search', cmd: 'upsert'}, (err, reply) => {
})
```

### `role:search,cmd:search`
Applies the provided query to elastic-search and returns the results.

```js
mu.dispatch({role: 'search', cmd: 'search'}, (err, reply) => {
})
```

## Messages Emitted
This micro-service emits no messages.
