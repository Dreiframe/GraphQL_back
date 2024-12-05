import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { v1 as uuid } from 'uuid'
import { GraphQLError } from 'graphql'

// https://fullstackopen.com/en/part8/graph_ql_server


let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]


let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

interface Book {
    title: string,
    published: number,
    author: string,
    id: string,
    genres: string[]
}

interface Author { name: string, id: string, born: number }

const typeDefs = `
    type Book {
        title: String!
        published: Int!
        author: String!
        id: ID!
        genres: [String!]!
    }

    type Author {
        name: String!
        id: ID!
        born: Int
        bookCount: Int!
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ): Book

        editAuthor(
            name: String!
            setBornTo: Int
        ): Author
    }

    type Query {
        bookCount: Int
        authorCount: Int
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
    }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (parent: undefined, args?: {author: string, genre: string}) => {
        if (!args) return books;
        if (!args.author && !args.genre) return books;

        let booksPointer = books
        if (args.author) booksPointer = booksPointer.filter(b => b.author === args.author);
        if (args.genre) booksPointer = booksPointer.filter(b => b.genres.includes(args.genre));
        return booksPointer
    },
    allAuthors: () => authors
  },
  Author: {
    bookCount: (parent: Author) => {
        return books.filter(b => b.author === parent.name).length
    }
  },
  Mutation: {
      addBook: (parent: undefined, args: Book) => {
        if (books.find(b => b.title === args.title)) {
            throw new GraphQLError('Title must be unique', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    invalidArgs: args.title
                }
            })
        }

        if (authors.filter(a => a.name === args.author).length === 0) {
            const author = {
                name: args.author,
                id: uuid()
            }
            authors = authors.concat(author)
        }

        const book = { ...args, id: uuid() }
        books = books.concat(book)
        return book
      },
      editAuthor: (parent: undefined, args: {name: string, setBornTo: number}) => {
        let newAuthor
        if(args.setBornTo) {
            authors = authors.map(a => {
                if (a.name === args.name) {
                    a.born = args.setBornTo
                    newAuthor = a
                    return a
                }
                return a
            })
        }

        return newAuthor
      }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }: { url: string }) => {
    console.log(`Server ready at ${url}`)
})