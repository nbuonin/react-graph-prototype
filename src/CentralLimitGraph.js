import { Component } from 'react';
import { VictoryChart, VictoryTheme, VictoryBar } from 'victory';
var seedrandom = require('seedrandom');
var jStat = require('jStat').jStat;

const createHistogramArray = (dist) => {
    let xSet = new Set(dist);

    // Build an array: [[val, 0], ...]
    const setRedux = (acc, val) => {
        acc.push([val[0], 0]);
        console.log(acc);
        return acc;
    }

    let xSetList = [...xSet.entries()].reduce(setRedux, new Array(0));
    console.log("xSetList: ");
    console.log(xSetList);

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

    //return dist.reduce(redux, xSetList);
    let result = dist.reduce(redux, xSetList);
    console.log("histogram: ");
    console.log(result);
    return result
}

const GraphForm = ({seed, population, populationSize, mean, handleChange}) => {
    console.log(population)
    const handleFormChange = (e) => {
        handleChange(e.target.id, e.target.value)
    }
    return (
        <>
        <form action="">
            <label htmlFor="seed">Seed: </label>
            <input type="text"
                id="seed"
                value={seed}
                onChange={handleFormChange}/>
            <label htmlFor="populationSize">Population Size: </label>
            <input type="number"
                id="populationSize"
                value={populationSize}
                onChange={handleFormChange}/>
            <label htmlFor="mean">Mean: </label>
            <input type="number"
                id="mean"
                value={mean}
                onChange={handleFormChange}/>
        </form>
        <VictoryChart theme={VictoryTheme.material}>
            <VictoryBar data={population}
                x={0}
                y={1}/>
        </VictoryChart>
        </>
    )
}

const GraphData = ({seed, populationSize, mean}) => {
    return (
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
            </tbody>
        </table>
    )
}

export class CentralLimitGraph extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.generatePopulation = this.generatePopulation.bind(this);
        seedrandom("cojoc", {glabal: true});

        const population = this.generatePopulation(10, 0, 1);
        const populationGraphData = createHistogramArray(population);

        this.state = {
            seed: "cojoc",
            populationSize: 10,
            population: population,
            populationGraphData: populationGraphData,
            mean: 0,
            stdDev: 1,
            sampleSize: 5,
            numberOfSamples: 10,
            sampleSet: [],
            sampleSetMean: []
        }
    }
    handleChange(key, value) {
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
            //return Math.round(i * 1);
            return i;
        })[0];
        //return jStat.rand(1, size)[0];
    }

    render() {
        return (
            <>
            <h2>Hello Nick!</h2>
            <GraphData seed={this.state.seed}
                populationSize={this.state.populationSize}
                mean={this.state.mean} />
            <GraphForm seed={this.state.seed}
                populationSize={this.state.populationSize}
                mean={this.state.mean}
                population={this.state.population}
                handleChange={this.handleChange}/>
            </>
        )
    }
}
