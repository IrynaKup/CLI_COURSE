import { input, select, confirm } from '@inquirer/prompts';

const users = [];

async function addUser() {
  
  while (true) {
    console.log('Adding New User');
    
    const name = await input({ message: 'Enter user name (or press Enter to finish):', });

    if (name.trim() === '') {
      console.log('Finished adding users.');
      break;
    }

    const gender = await select({ message: `Select gender for ${name}:`,
      choices: [
        { name: 'Male', value: 'male' },
        { name: 'Female', value: 'female' },
      ],
    });

    const age = await input({ 
        message: `Enter age for ${name}:`,
        validate: (value) => {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed) || parsed <= 0) {
            return 'Please enter a valid positive number for age.';
          }
          return true;
        },
    });

    users.push({
      name: name.trim(),
      gender: gender,
      age: parseInt(age, 10),
    });

    console.log(`User ${name} added successfully!`);
    
  }
}

async function searchUser() {
  console.log('\nSearch User');
  
  const searchName = await input({ message: 'Enter the name of the user to search for:' });

  const trimmedSearchName = searchName.trim();
  if (trimmedSearchName === '') {
    console.log('Search name cannot be empty.');
    return;
  }

  const foundUser = users.find(
    (user) => user.name.toLowerCase() === trimmedSearchName.toLowerCase()
  );

  if (foundUser) {
    console.log('\nUser found');
    console.log(`Name:   ${foundUser.name}`);
    console.log(`Gender: ${foundUser.gender}`);
    console.log(`Age:    ${foundUser.age}`);
  } else {
    console.log(`User "${trimmedSearchName}" not found in the database.`);
  }
}

async function runApp() {
  console.log('\nWelcome to the Primitive DB CLI');

  await addUser();

  if (users.length === 0) {
    console.log('\nNo users were added. Exiting program.');
    return;
  }

  console.log(`\nTotal users in database: ${users.length}`);
  
  const shouldSearch = await confirm({ 
      message: 'Would you like to search for a user by name?',
      default: false,
  });

  if (shouldSearch) {
    await searchUser();
  } else {
    console.log('\nThis is the end...');
  }
}
runApp().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});