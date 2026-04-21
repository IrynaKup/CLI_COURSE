import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

function interactiveSort() {
    console.log('Enter 10 words and numbers separated by spaces');
    console.log('Example: pizza 300 pizza 301 burger 1000 salad 150 pasta 1000'); //kal
    console.log('x - exit the program\n');

   interface DataSet {
    words: string[];
    numbers: number[];
    }
    function splitData(items: string[]) : DataSet {
        const words: string[] = [];
        const numbers: number[] = [];
        items.forEach((item: string) => {
            if (typeof Number(item)){
                words.push(item);
            } else {
                numbers.push(Number(item));
            }
        });
        return { words, numbers };
    }

    interface CommandMap {
    [key: string]: (data: any[]) => any;
    }
    const commands: CommandMap = {
        // a. Sort words alphabetically
        a: (words) => {
            const sorted = [...words].sort();
            console.log(sorted.join(' '));
        },
        
        // b. Numbers in ascending order
        b: (numbers) => {
            const sorted = [...numbers].sort((a, b) => a - b);
            console.log(sorted.join(' '));
        },
        
        // c. Numbers in descending order
        c: (numbers) => {
            const sorted = [...numbers].sort((a, b) => b - a);
            console.log(sorted.join(' '));
        },
        
        // d. Words by length
        d: (words) => {
            const sorted = [...words].sort((a, b) => a.length - b.length);
            console.log(sorted.join(' '));
        },
        
        // e. Unique words
        e: (words) => {
            const unique = [...new Set(words)];
            console.log(unique.join(' '));
        },
        
        // f. Unique values from the entire set
        f: (data) => {
            const unique = [...new Set(data)];
            console.log(unique.join(' '));
        }
    };

    function showMenu() {
        console.log('\nAvailable commands:');
        console.log('a - sort words alphabetically');
        console.log('b - numbers in ascending order');
        console.log('c - numbers in descending order');
        console.log('d - words by length');
        console.log('e - unique words');
        console.log('f - unique values');
        console.log('x - exit the program');
    }

    function main(data: string[]) {
        const { words, numbers } = splitData(data);
        
        showMenu();
        
        async function askCommand() {
            const command = await rl.question('\nEnter command: ');
            if (command.toLowerCase() === 'x') {
                console.log('Program terminated');
                rl.close();
                return;
            }

            if (commands[command]) {
                if (command === 'f') {
                    commands[command](data);
                } else if (command === 'a' || command === 'd' || command === 'e') {
                    commands[command](words);
                } else if (command === 'b' || command === 'c') {
                    commands[command](numbers);
                }
            } else {
                console.warn('Invalid command. Use a-f or x');
            }
            
            askCommand(); 
        }
        
        askCommand();
    }

    async function askForData() {
        const input = await rl.question('Enter 10 elements separated by spaces: ');
        if (input.toLowerCase() === 'x') {
            console.log('Program terminated');
            rl.close();
            return;
        }

        const items = input.trim().split(/\s+/);
        
        if (items.length !== 10) {
            console.log(' Error: need 10 elements, but got ${items.length}');
            console.log('Try again\n');
            askForData(); 
            return;
        }

        main(items); 
    }
    askForData();
}
interactiveSort();