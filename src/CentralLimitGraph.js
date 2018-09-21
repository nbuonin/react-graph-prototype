import { Component } from 'react';
import { VictoryChart, VictoryTheme, VictoryBar, VictoryArea, VictoryLine } from 'victory';
import * as _ from 'lodash';
var seedrandom = require('seedrandom');
var jStat = require('jStat').jStat;

const roundFloat = (n) => {
    return parseFloat(n.toFixed(1));
}

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

const GraphForm = ({seed, populationGraphData, populationSize, mean, sampleMeansGraphData, handleChange}) => {
    console.log(sampleMeansGraphData);
    return (
        <>
        <VictoryChart theme={VictoryTheme.material}
            height={200}>
            <VictoryBar data={populationGraphData}
                x={0}
                y={1}/>
            { sampleMeansGraphData &&
                <VictoryLine data={sampleMeansGraphData}
                    x={0}
                    y={1}/>
            }
        </VictoryChart>
        </>
    )
}

const GraphData = ({seed, populationSize, mean, stdDev,
    sampleSize, numberOfSamples, handleChange, runSample}) => {

    const handleFormChange = (e) => {
        handleChange(e.target.id, e.target.value);
    };

    const handleRunSample = (e) => {
        e.preventDefault();
        runSample();
    }
    return (
        <div className={"row"}>
            <div className={"col-4"}>
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
                        <tr>
                            <td>Sample Size</td>
                            <td>{sampleSize}</td>
                        </tr>
                        <tr>
                            <td>Number of samples</td>
                            <td>{numberOfSamples}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={"col-4"}>
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
                        <label htmlFor="stdDev">StdDev: </label>
                        <input type="number"
                            id="stdDev"
                            value={stdDev}
                            onChange={handleFormChange}/>
                    </div>
                </form>
            </div>
            <div className={"col-4"}>
                <h3>Sample Params</h3>
                <form onClick={handleRunSample} >
                    <div>
                        <label htmlFor="sampleSize">Sample Size: </label>
                        <input type="number"
                            id="sampleSize"
                            value={sampleSize}
                            onChange={handleFormChange}/>
                    </div>
                    <div>
                        <label htmlFor="numberOfSamples">Number of samples: </label>
                        <input type="number"
                            id="numberOfSamples"
                            value={numberOfSamples}
                            onChange={handleFormChange}/>
                    </div>
                    <div>
                        <input type="submit" value="Run Sample"/>
                    </div>
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
        this.runSample = this.runSample.bind(this);
        //this.sampleMeanIterator = this.sampleMeanIterator.bind(this);
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
            sampleMeans: [],
            sampleMeansGraphData: []
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
            return roundFloat(i);
        })[0];
    }
    runSample() {
        // take samples from population values
        // - one sample consists of N sampleSize, which are then averaged
        // - N numberOfSamples are taken
        // push these to sampleSet
        // get the histogram and set state, render a line graph
        let sampleMeans = [];
        for (var i = 0; i < this.state.numberOfSamples; i++) {
            let samples = _.sampleSize(
                this.state.population,
                this.state.sampleSize);
            sampleMeans.push(roundFloat(_.mean(samples)));
        }
        let sampleMeansData = createHistogramArray(sampleMeans);
        this.setState({
            sampleMeans: sampleMeans,
            sampleMeansGraphData: sampleMeansData
        });
    }
    render() {
        return (
            <>
            <h2>Central Limit Theorem</h2>
            <GraphForm populationGraphData={this.state.populationGraphData}
                sampleMeansGraphData={this.state.sampleMeansGraphData}/>
            <GraphData seed={this.state.seed}
                populationSize={this.state.populationSize}
                mean={this.state.mean}
                stdDev={this.state.stdDev}
                sampleSize={this.state.sampleSize}
                numberOfSamples={this.state.numberOfSamples}
                handleChange={this.handleChange}
                runSample={this.runSample}/>
            </>
        )
    }
}
