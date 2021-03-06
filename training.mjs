import {
    generateRandomTree
} from './tree.mjs';
import {
    maskInfo,
    log
} from './utils.mjs';
import {
    Game,
} from './snake.mjs';

const _ = require('lodash');
const maximumInitialDepth = 10;

function fitnessEval(decisionTree, repeats = 2) {
    let total = 0;
    for (let i = 0; i < repeats; i++) {
        let game = new Game({
            visible: false,
            manualControl: false,
            foodCount: 1
        });
        game.snake.setDecisionFunction(decisionTree);
        game.start();
        total += game.snake.hasEaten();
    }
    return Math.floor(total / repeats);
}

class Population {
    constructor({
        size,
        crossover,
        elitism,
        mutation
    }) {
        this.size = size;
        this.crossover = crossover;
        this.elitism = elitism;
        this.mutation = mutation;

        this.tournamentSize = 3;

        this.pops = [];
        for (let i = 0; i < size; i++) {
            let tree = generateRandomTree(maximumInitialDepth);
            tree.fitness = fitnessEval(tree);
            this.pops.push(tree);
        }
        this._sortPops();
    }
    _measureFitness(repeats = 2) {
        

        for (let i = 0; i < this.size; i++) {
            if(this.pops[i] === undefined) {
                console.log('No more pops at index', i);
            }
            this.pops[i].fitness = fitnessEval(this.pops[i], repeats);
        }
    }

    _sortPops() {
        this.pops.sort((e1, e2) => e2.fitness - e1.fitness);
    }

    tournamentSelection() {
        let best = this.pops[Math.floor(Math.random() * this.pops.length)];
        for (let i = 0; i < this.tournamentSize; i++) {
            let contender = this.pops[Math.floor(Math.random() * this.pops.length)];
            if (contender.fitness > best.fitness) {
                best = contender;
            }
        }
        return best;
    }

    selectParents() {
        return [this.tournamentSelection(), this.tournamentSelection()];
    }

    evolve() {
        const eliteCutoff = Math.floor(this.size * this.elitism);
        let elite = _.cloneDeep(this.pops.slice(0, eliteCutoff));

        while (elite.length < this.size) {
            if (Math.random() <= this.crossover) {
                const [parent1, parent2] = this.selectParents();
                const children = parent1.mate(parent2);
                children.forEach(child => {
                    if (Math.random() < this.mutation) {
                        elite.push(child.mutate());
                    } else {
                        elite.push(child);
                    }
                })
            } else {
                if (Math.random() <= this.mutation) {
                    elite.push(this.pops[elite.length].mutate());
                } else {
                    elite.push(this.pops[elite.length]);
                }
            }
        }
        this.pops = elite;
        this._measureFitness();
        this._sortPops();
        log(this.pops.map(pop => pop.fitness));
    }

    get maxFitness() {
        return this.pops[0].fitness;
    }
    get topPop() {
        return this.pops[0];
    }

    finalSelection() {
        const eliteCutoff = Math.floor(this.size * 0.05);
        this.pop = _.cloneDeep(this.pops.slice(0, eliteCutoff));
        this.size = eliteCutoff;
        this._measureFitness(100);
        this._sortPops();
    }
}

const generations = 200;
const pop = new Population({
    size: 100,
    crossover: 0.8,
    elitism: 0.2,
    mutation: 0.3
});


[...Array(generations).keys()].forEach(gen => {
    console.log('Running generation number', gen, 'current gen max fitness ', pop.maxFitness);
    pop.evolve();
});

pop.finalSelection();

console.log('\n==============================\nEvolution over\n')
console.log('Final normalized fitness achieved: ', pop.topPop.fitness);

const fs = require("fs");

fs.writeFile("outputs/result_function.json", JSON.stringify(pop.topPop, maskInfo), (err) => {
    if (err) console.log(err);
    console.log("Successfully written resulting function into file.");
});