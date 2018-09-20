import { Component } from 'react';
import { VictoryChart, VictoryTheme, VictoryBar, VictoryArea, VictoryLine } from 'victory';
var seedrandom = require('seedrandom');
var jStat = require('jStat').jStat;

const createHistogramArray = (dist) => {
    let xSet = new Set(dist);

    // Build an array: [[val, 0], ...]
    const setRedux = (acc, val) => {
        acc.push([val[0], 0]);
        return acc;
    }

    let xSetList = [...xSet.entries()].reduce(setRedux, new Array(0));

    const redux = (acc, val) => {
        // findVal needs to be declared each time to
        // create a closure with val
        let findVal = (el) => el[0] == val;
        let idx = acc.findIndex(findVal);
        if (idx > -1) {
            acc[idx][1] += 1;
        }
        return acc;
    }

    return dist.reduce(redux, xSetList);
}

const GraphForm = ({seed, populationGraphData, populationSize, mean, handleChange}) => {
    return (
        <>
        <VictoryChart theme={VictoryTheme.material}
            height={200}>
            <VictoryBar data={populationGraphData}
                x={0}
                y={1}/>
            <VictoryArea data={populationGraphData}
                x={0}
                y={1}/>
        </VictoryChart>
        </>
    )
}

const GraphData = ({seed, populationSize, mean, stdDev, handleChange}) => {
    const handleFormChange = (e) => {
        handleChange(e.target.id, e.target.value)
    }
    return (
        <div class={"row"}>
            <div class={"col-4"}>
                <h3>Debug Data</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>seed</td>
                            <td>{seed}</td>
                        </tr>
                        <tr>
                            <td>populationSize</td>
                            <td>{populationSize}</td>
                        </tr>
                        <tr>
                            <td>mean</td>
                            <td>{mean}</td>
                        </tr>
                        <tr>
                            <td>Standard Deviation</td>
                            <td>{stdDev}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class={"col-4"}>
                <h3>Population Params</h3>
                <form action="">
                    <div>
                        <label htmlFor="seed">Seed: </label>
                        <input type="text"
                            id="seed"
                            value={seed}
                            onChange={handleFormChange}/>
                    </div>
                    <div>
                        <label htmlFor="populationSize">Population Size: </label>
                        <input type="number"
                            id="populationSize"
                            value={populationSize}
                            onChange={handleFormChange}/>
                    </div>
                    <div>
                        <label htmlFor="mean">Mean: </label>
                        <input type="number"
                            id="mean"
                            value={mean}
                            onChange={handleFormChange}/>
                    </div>
                    <div>
                        <label htmlFor="mean">StdDev: </label>
                        <input type="number"
                            id="stdDev"
                            value={stdDev}
                            onChange={handleFormChange}/>
                    </div>
                </form>
            </div>
            <div class={"col-4"}>
                <h3>Sample Params</h3>
                <form action="">
                    <div>
                        <label htmlFor="seed">Seed: </label>
                        <input type="text"
                            id="seed"
                            value={seed}
                            onChange={handleFormChange}/>
                    </div>
                    <button>Run Sample</button>
                </form>
            </div>
        </div>
    )
}

export class CentralLimitGraph extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.generatePopulation = this.generatePopulation.bind(this);
        seedrandom("cojoc", {glabal: true});

        const populationSize = 1000;
        const mean = 0;
        const stdDev = 1;
        const population = this.generatePopulation(
            populationSize,
            mean,
            stdDev
        );
        const populationGraphData = createHistogramArray(population);

        this.state = {
            seed: "cojoc",
            populationSize: populationSize,
            population: population,
            populationGraphData: populationGraphData,
            mean: mean,
            stdDev: stdDev,
            sampleSize: 5,
            numberOfSamples: 10,
            sampleSet: [],
            sampleSetMean: []
        }
    }
    handleChange(key, value) {
        console.log(this.state.population);
        const population = this.generatePopulation(
                key === "populationSize" ? value : this.state.populationSize,
                key === "mean" ? value : this.state.mean,
                key === "stdDev" ? value : this.state.stdDev);
        const populationGraphData = createHistogramArray(population);
        this.setState({
            population: population,
            populationGraphData: populationGraphData,
            [key]: value
        });
    }
    generatePopulation(size, mean, stdDev) {
        return jStat.create(1, size, (row) => {
            let i = jStat.normal.sample(mean, stdDev);
            return parseFloat(i.toFixed(1));
        })[0];
    }

    render() {
        return (
            <>
            <h2>Central Limit Theorem</h2>
            <GraphForm populationGraphData={this.state.populationGraphData}/>
            <GraphData seed={this.state.seed}
                populationSize={this.state.populationSize}
                mean={this.state.mean}
                stdDev={this.state.stdDev}
                handleChange={this.handleChange}/>
            </>
        )
    }
}
