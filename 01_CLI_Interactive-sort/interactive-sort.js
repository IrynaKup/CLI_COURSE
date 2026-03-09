function interactiveSort() {
    console.log('Enter 10 words and numbers separated by spaces');
    console.log('Example: pizza 300 pizza 301 burger 1000 salad 150 pasta 1000'); //kal
    console.log('x - exit the program\n');

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    function splitData(items) {
        const words = [];
        const numbers = [];
        items.forEach(item => {
            if (isNaN(item)) {
                words.push(item);
            } else {
                numbers.push(Number(item));
            }
        });
        return { words, numbers };
    }

    const commands = {
        // a. Sort words alphabetically
        a: (words) => {
            const sorted = words.slice().sort((a, b) => a.localeCompare(b));
            console.log('Words alphabetically:', sorted);
        },
        
        // b. Numbers in ascending order
        b: (numbers) => {
            const sorted = numbers.slice().sort((a, b) => a - b);
            console.log('Numbers ascending:', sorted);
        },
        
        // c. Numbers in descending order
        c: (numbers) => {
            const sorted = numbers.slice().sort((a, b) => b - a);
            console.log('Numbers descending:', sorted);
        },
        
        // d. Words by length
        d: (words) => {
            const sorted = words.slice().sort((a, b) => a.length - b.length);
            console.log('Words by length:', sorted);
        },
        
        // e. Unique words
        e: (words) => {
            const unique = [...new Set(words)];
            console.log('Unique words:', unique);
        },
        
        // f. Unique values from the entire set
        f: (data) => {
            const unique = [...new Set(data)];
            console.log('Unique values:', unique);
        }
    };

    // Function to show menu
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

    function main(data) {
        const { words, numbers } = splitData(data);
        
        console.log('Words:', words);
        console.log('Numbers:', numbers);
        
        showMenu();
        
        function askCommand() {
            rl.question('\nEnter command: ', (command) => {
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
                    console.log('Invalid command. Use a-f or x');
                }
                
                askCommand(); 
            });
        }
        
        askCommand();
    }

    function askForData() {
        rl.question('Enter 10 elements separated by spaces: ', (input) => {
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
        });
    }
    askForData();
}
interactiveSort();