const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('./logger')
const { bookmarks } = require('./store')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmark')
    .get((req, res) =>{
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) =>{
        const { title, url, description, rating } = req.body

        //validate all that the required fields were provided
        if(!title){
            logger.error('Title is required')
            return res
                .status(400)
                .send('Invalid Data')
        }
        if(!url){
            logger.error('Url is required')
            return res
                .status(400)
                .send('Invalid Data')
        }
        if(!description){
            logger.error('Description is required')
            return res
                .status(400)
                .send('Invalid Data')
        }
        if(!rating){
            logger.error('Rating is required')
            return res
                .status(400)
                .send('Invalid Data')
        }

        //validate that rating is a number between 1-5
        if(rating > 5 || rating < 1 || rating % 1 !== 0){
            logger.error('Rating must be a whole number between 1-5')
            return res
                .status(400)
                .send('Invalid Data')
        }

        //now post the successfully validated req
        const id = uuid()

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }

        bookmarks.push(bookmark)

        logger.info(`Bookmark with id ${id} created`)

        res
            .status(201)
            .location(`https://localhost:8000/bookmark/${id}`)
            .json(bookmark)
    }) 

bookmarkRouter
    .route('/bookmark/:id')
    .get((req, res) => { 
        const { id } =req.params
        const bookmark = bookmarks.find(b => b.id == id)

        if(!bookmark){
            logger.error(`Card with id ${id} not found.`)
            return res
                .status(404)
                .send('Card not found')
        }

        res.json(bookmark)
    })
    .delete((req, res) =>{
        const { id } = req.params

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

        if (bookmarkIndex === -1){
            logger.error(`Card with id ${id} not found`)
            return res
                .status(404)
                .send('Not found')
        }

        bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Card with id ${id} deleted`)

        res
            .status(204)
            .end()
    })

module.exports = bookmarkRouter