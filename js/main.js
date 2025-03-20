/**
{
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
}
 */

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see books}
 */
function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBookToCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId /* HTMLELement */) {

  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener(SAVED_EVENT, () => {
  alert('Data berhasil disimpan');
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookList');
  const listCompleted = document.getElementById('completeBookList');

  // clearing list item
  uncompletedBookList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
})

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;
  textTitle.setAttribute('data-testid', 'bookItemTitle');

  const textAuthor = document.createElement('p');
  textAuthor.innerText = author;
  textAuthor.setAttribute('data-testid', 'bookItemAuthor');

  const textYear = document.createElement('p');
  textYear.innerText = year;
  textYear.setAttribute('data-testid', 'bookItemYear');

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('book_item', 'shadow');
  container.append(textContainer);
  container.setAttribute('data-testid', `bookItem`);
  container.setAttribute('data-bookid', `${id}`);

  if (isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(id);
    });

    container.append(undoButton, trashButton);
  } else {

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(id);
    });

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    checkButton.addEventListener('click', function () {
      addBookToCompleted(id);
    });

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      showEditForm();
      const editForm = document.getElementById('editBookForm');
        editForm.addEventListener('submit', function (event) {
          event.preventDefault();
          editBookItem(id)
      })
    });

    container.append(checkButton, trashButton, editButton);
  }

  return container;
}

function addBook() {
  const generateID = generateId();
  const textTitle = document.getElementById('bookFormTitle').value;
  const textAuthor = document.getElementById('bookFormAuthor').value;
  const textYear = parseInt(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const bookObject = generateBookObject(generateID, textTitle, textAuthor, textYear, isComplete);
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {

  const submitForm /* HTMLFormElement */ = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBookByName();
  })

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function searchBookByName() {
  const searchBook = document.getElementById('searchBookTitle').value;
  const uncompletedBookList = document.getElementById('incompleteBookList');
  const listCompleted = document.getElementById('completeBookList');

  // clearing list item
  uncompletedBookList.innerHTML = '';
  listCompleted.innerHTML = '';

  if (searchBook === '') {
    document.dispatchEvent(new Event(RENDER_EVENT));
    return;
  }
  
  for (const bookItem of books) {
    bookItem.title = bookItem.title.toString();
    if (searchBook.toLowerCase() === bookItem.title|| searchBook.toUpperCase() === bookItem.title || searchBook === bookItem.title) {
      const bookElement = makeBook(bookItem);
      if (bookItem.isComplete) {
        listCompleted.append(bookElement);
      } else {
        uncompletedBookList.append(bookElement);
      }
    }
  }
}

function showEditForm() {
  const edit = document.getElementById('editBook');
  edit.style.display = 'block';
}


function editBookItem(bookId) {
  const bookItem = findBook(bookId);
  const title = document.getElementById('editBookFormTitle').value;
  const author = document.getElementById('editBookFormAuthor').value;
  const year = document.getElementById('editBookFormYear').value;

  bookItem.title = title;
  bookItem.author = author;
  bookItem.year = year;
  
  const edit = document.getElementById('editBook');
  edit.style.display = 'none';
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}