import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";

const DataJson = "users.json";

import { input, select, confirm } from "@inquirer/prompts";

interface User {
  name: string;
  gender: string;
  age: number;
}
const users: User[] = [];
async function saveToFile() {
  try {
    await writeFile(DataJson, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving to file:", error);
  }
}

async function loadFromFile() {
  try {
    if (existsSync(DataJson)) {
      const data = await readFile(DataJson, "utf-8");
      const parsed = JSON.parse(data);
      users.length = 0;
      users.push(...parsed);
    }
  } catch (error) {
    console.error("Error loading file:", error);
  }
}
async function addUser() {
  while (true) {
    try {
      const name = await input({
        message: "Enter user name:",
        validate: (value: string) => {
          const trimmed = value.trim();
          if (/\d/.test(trimmed)) return "Name should not contain numbers.";
          return true;
        },
      });
      const formattedName =
        name.trim().charAt(0).toUpperCase() +
        name.trim().slice(1).toLowerCase();
      if (name.trim() === "") {
        console.log("Finish.");
        return;
      }

      const gender = await select({
        message: `Select gender, ${name}:`,
        choices: [
          { name: "Male", value: "male" },
          { name: "Female", value: "female" },
        ],
      });

      const age = await input({
        message: `Enter age, ${formattedName}:`,
        validate: (value: string) => {
          const num = Number(value);
          if (isNaN(num) || num < 0) {
            return "Please enter a valid positive number for age.";
          }
          return true;
        },
      });
      users.push({
        name: formattedName,
        gender: gender,
        age: Number(age),
      });
      await saveToFile();
      console.log(`User ${formattedName} added to DataBase.`);
    } catch (error) {
      console.log("\n..");
      return;
    }
  }
}

async function searchUser() {
  while (true) {
    try {
      console.log("\nSearch User");

      const searchName = await input({
        message: "Enter the name of the user to search for:",
      });

      const trimmedSearchName = searchName.trim();
      if (trimmedSearchName === "") {
        console.log("Search finished.");
        return;
      }

      const foundUsers = users.filter(
        (user) => user.name.toLowerCase() === trimmedSearchName.toLowerCase(),
      );

      if (foundUsers.length > 0) {
        console.log(`\nFound ${foundUsers.length} user(s):`);
        foundUsers.forEach((user) => {
          console.log(`${user.name} | ${user.gender} | ${user.age}`);
        });
      } else {
        console.log(`User "${trimmedSearchName}" not found.\n`);
      }
    } catch (error) {
      console.log("\nSearch cancelled.");
      return;
    }
  }
}

async function runApp() {
  try {
    await loadFromFile();
    await addUser();
    if (users.length === 0) {
      console.log("\nNo users in database.");
      return;
    }
    console.log(`\nTotal users in database: ${users.length}`);
    if (users.length > 0) {
      console.table(users);
    }
    const shouldSearch = await confirm({
      message: "Search users?",
      default: false,
    });

    if (shouldSearch) {
      await searchUser();
    }
  } catch (error) {
    console.error("\n:", error);
  }
}
runApp().catch((error) => {
  console.error(":", error);
  process.exit(1);
});
