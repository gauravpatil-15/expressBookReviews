const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ message: "Username and Password are required" });
  if (isValid(username)) {
    users.push({"username":username,"password":password});
    return res.status(200).json({ message: "User created successfully" });
  } else {
    return res.status(400).json({ message: "User already exists" });
  }
});

const getallBooks = new Promise((resolve, reject) => {
  if (Object.keys(books).length > 0) {
    resolve(books);
  } else {
    reject(new Error("Books Database is empty"));
  }
});

public_users.get('/', function (req, res) {
  getallBooks.then(function (books) {
    return res.status(300).json({ message: JSON.stringify(books, null, 4) });
  }).catch(function (err) {
    return res.status(500).json({ error: err.message });
  });
});

public_users.get('/isbn/:isbn', function (req, res) {
  getallBooks.then(function (books) {
    let isbn = req.params.isbn;
    if (isbn in books) {
      return res.status(300).json(books[isbn]);
    } else {
      return res.status(404).send('Book not found with the given ISBN');
    }

  }).catch(function (err) {
    return res.status(500).json({ error: err.message });
  });
});

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  const getBooksbyauthor = new Promise(function (resolve, reject) {
    for (const isbn in books) {
      const book = books[isbn];

      if (book.author === author) {
        booksByAuthor.push(book);
      }
    }

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject(`No books found for author '${author}'`);
    }
  });
  getBooksbyauthor
    .then(function (result) {
      return res.status(200).json({ message: result });
    })
    .catch(function (error) {
      return res.status(404).json({ error: error });
    });
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];
  const getBooksbytitle = new Promise(function (resolve, reject) {
    for (const isbn in books) {
      const book = books[isbn];
      if (book.title === title) {
        booksByTitle.push(book);
      }
    }
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject(`No books found for title '${title}'`);
    }
  });
  getBooksbytitle
    .then(function (result) {
      return res.status(200).json({ message: result });
    })
    .catch(function (error) {
      return res.status(404).json({ error: error });
    });
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (isbn in books) {

    return res.status(200).json({ message: books[isbn].reviews });
  } else {
    return res.status(404).send('Book not found with the given ISBN');
  }
});

module.exports.general = public_users;