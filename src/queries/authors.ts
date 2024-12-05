import { pool } from "../connection/psql"
import Joi from 'joi'

const authorSchema = Joi.object({
    name: Joi.string().min(5).max(100).required(),
    born: Joi.number().min(0).max(2100),
    bookCount: Joi.number().min(0)
})

export const getAuthors = () => {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM authors;',
            (error, results) => {
                if (error) {
                    reject(error)
                    return
                }
    
                resolve(results.rows)
                return
            }
        )
    })
}