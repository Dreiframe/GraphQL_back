import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { v1 as uuid } from 'uuid'
import { GraphQLError } from 'graphql'

let persons: Person[] = [
    {
        name: "Arto Hellas",
        phone: "040-123543",
        street: "Tapiolankatu 5 A",
        city: "Espoo",
        id: "3d594650-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Matti Luukkainen",
        phone: "040-432342",
        street: "Malminkaari 10 A",
        city: "Helsinki",
        id: '3d599470-3436-11e9-bc57-8b80ba54c431'
    },
    {
        name: "Venla Ruuska",
        street: "Nallemäentie 22 C",
        city: "Helsinki",
        id: '3d599471-3436-11e9-bc57-8b80ba54c431'
    },
]

const typeDefs = `
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!  
    id: ID!
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(
      name: String!
      phone: String!
    ): Person
  }

  
  enum YesNo {
    YES
    NO
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  }
`

interface Person {
    name?: String,
    phone?: String,
    city?: string,
    street?: string
    id?: string
}

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (parent: undefined, args: Person) => {
            if (!args.phone) return persons;
            const byPhone = (person: Person) => args.phone === 'YES' ? person.phone : !person.phone
            return persons.filter(byPhone)
        },
        findPerson: (parent: undefined, args: Person) =>
            persons.find(p => p.name === args.name)
    },
    Person: {
        address: (parent: Person) => {
            return {
                street: parent.street,
                city: parent.city
            }
        }
    },
    Mutation: {
        addPerson: (parent: undefined, args: Person) => {
            if (persons.find(p => p.name === args.name)) {
                throw new GraphQLError('Name must be unique', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name
                    }
                })
            }

            const person = { ...args, id: uuid() }
            persons = persons.concat(person)
            return person
        },
        editNumber: (parent: undefined, args: Person) => {
            const person = persons.find(p => p.name === args.name)
            if (!person) {
                return null
            }

            const updatedPerson = { ...person, phone: args.phone }
            persons = persons.map(p => p.name === args.name ? updatedPerson : p)
            return updatedPerson
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})