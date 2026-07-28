# Mixed units in network history

## What this demonstrates

Each network sample is converted independently to B, KB, MB, or GB. The chart
later plots only the numeric `value`, discarding each sample's unit.

## Run

```bash
node audit-repros/005-network-chart-units/repro.mjs
```

## Expected

A rise from 999 B/s to 1,000 B/s should rise slightly on the graph.

## Actual

The plotted values fall from 999 to 1 because the second sample is stored as
`1 KB`.

## Status

Confirmed with the frontend's conversion algorithm.
