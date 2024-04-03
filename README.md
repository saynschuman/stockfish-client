# Stockfish Client Library

This library is designed to facilitate communication with the Stockfish chess engine from applications. It is based on the Stockfish client code extracted from the [lichobile](https://github.com/lichess-org/lichobile) project, the mobile application for lichess.org.

## License

This project is released under the GPL-3.0-or-later license, as is the original `lichobile` project from which the Stockfish client code was derived. See the LICENSE file in this repository for the full license text.

## Original Project

The Stockfish client code used in this library was taken from the `lichobile` project, version 8.0.0. The `lichobile` project is developed and maintained by Vincent Velociter and other contributors, and its source code can be found at [lichess-org/lichobile](https://github.com/lichess-org/lichobile).

## Modifications

This library includes modifications to the original Stockfish client code to make it usable as a standalone library. These modifications are primarily around restructuring the code for ease of use as a module and may include changes for compatibility with different environments or enhancements in functionality.

## Usage

To use this library in your project, include it as a dependency in your project's package.json file. You can then import and use the Stockfish client functionality as demonstrated in the example usage section below.

### Example Usage

```javascript
import { StockfishClient } from 'stockfish-client';

const client = new StockfishClient(2); // Initialize with expected PVs
client.processOutput(messageEvent); // Process a message event from Stockfish
