
# muzoo-coveralls
A microservice that provides Coveralls data for MuZoo. This microservice depends
on Coveralls and the NPM registry but also caches retrieved data to reduce load on both
public registries.

## Running

To run simply use npm:

```
npm install
npm run start
```

## Configuration

### Environment Variables
Various settings can be changed using environment variables, see the list below for
all available variable names.

#### COVERALLS_HOST
  - The host to listen on.
  - Defaults to `localhost`.

#### COVERALLS_PORT
  - The port to listen on.
  - Defaults to `6053`.

#### COVERALLS_REGISTRY
  - Changes the Coveralls URL used to retrieve the module info.
  - Defaults to `https://coveralls.io/`.

#### NPM_REGISTRY
  - Changes the npm registry used to retrieve the module info.
  - Defaults to `http://registry.npmjs.org/`.

## Messages Handled

### `role:coveralls, cmd:get`
Returns Coveralls specific data for the module name provided.

```js
mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
```

Data Returned
- name: Name of the module,
- coverageChange: coverage changed,
- coveredPercent: overall coverage percent,
- badgeUrl: Url of the Coveralls badge,
- cached: - The time the data was last cached at.

## Messages Emitted
This service emits no messages
