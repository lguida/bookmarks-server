const { expect } = require('chai')
const supertest = require('supertest')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmark.fixtures')

let db

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
})

after('disconnect from db', () => db.destroy())

before('clean the table', () => db('bookmarks').truncate())

afterEach('cleanup', () => db('bookmarks').truncate())

describe('GET /api/bookmarks', () => {
    context('Given no bookmarks', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, [])
        })
    })

    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray()
        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })

        it('GET /api/bookmarks responds with 200 and all of the bookmarks', () => {
            return supertest(app)
                .get('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, testBookmarks)
        })
    })

    context('Given there is a malicious post', () =>{
        const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

        beforeEach('insert malicious bookmark', () => {
            return db
            .into('bookmarks')
            .insert([maliciousBookmark])
        })

        it('removes XSS attack content', () => {
            return supertest(app)
            .get(`/api/bookmarks`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect(res => {
                expect(res.body[0].title).to.eql(expectedBookmark.title)
                expect(res.body[0].description).to.eql(expectedBookmark.description)
            })
        })
    })
})

describe('GET /api/bookmarks/:bookmark_id', () => {
    context('Given no bookmarks', () => {
        it('responds with 404', () => {
            const bookmarkId = 123456
            return supertest(app)
                .get(`/api/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { "error": {"message": `Bookmark Not Found`} })
        })
    })

    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray()
        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })

        it('GET /api/bookmarks/:bookmark_id responds with 200 and the specific bookmark', () => {
            const bookmarkId = 2
            const expectedBookmark = testBookmarks[bookmarkId - 1]
            return supertest(app)
                .get(`/api/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedBookmark)
        })
    })
    context('Given there is a malicious post', () =>{
        const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

        beforeEach('insert malicious bookmark', () => {
            return db
            .into('bookmarks')
            .insert([maliciousBookmark])
        })

        it('removes XSS attack content', () => {
            return supertest(app)
            .get(`/api/bookmarks/${maliciousBookmark.id}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect(res => {
                expect(res.body.title).to.eql(expectedBookmark.title)
                expect(res.body.description).to.eql(expectedBookmark.description)
            })
        })
    })
})

describe('POST /api/bookmarks', () => {
    it('creates a bookmark, responding with 201 and the new bookmark', function() {
        const newBookmark = {
            title: 'sample title',
            url: 'https://www.google.com',
            description: 'sample description',
            rating: 5
        }
        return supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send(newBookmark)
            .expect(201)
            .expect(res => {
                expect(res.body.title).to.eql(newBookmark.title)
                expect(res.body.url).to.eql(newBookmark.url)
                expect(res.body.description).to.eql(newBookmark.description)
                expect(parseInt(res.body.rating)).to.eql(newBookmark.rating)
                expect(res.body).to.have.property('id')
                expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
            })
            .then(res =>
                supertest(app)
                .get(`/api/bookmarks/${res.body.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(res => {
                    expect(res.body.title)
                    expect(res.body.url)
                    expect(res.body.description)
                    expect(parseInt(res.body.rating))
                    expect(res.body.id)
                })
            )
        })
        const requiredFields = ['title', 'url', 'description', 'rating']

        requiredFields.forEach(field => {
            const newBookmark = {
                title: 'sample title',
                url: 'https://www.google.com',
                description: 'sample description',
                rating: 4
            }
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field]
                console.log(newBookmark)

                return supertest(app)
                    .post('/api/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400, `'${field}' is required`)
            })
        })
    it('removes XSS attack content from response', () => {
        const{ maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
        return supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .send(maliciousBookmark)
            .expect(201)
            .expect(res => {
                expect(res.body.title).to.eql(expectedBookmark.title)
                expect(res.body.description).to.eql(expectedBookmark.description)
            })
    })
})

describe('DELETE /api/bookmarks/:id', () => {
    context(`Given no bookmarks`, () => {
      it(`responds 404 whe bookmark doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/bookmarks/123`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Bookmark Not Found` }
          })
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      it('removes the bookmark by ID from the store', () => {
        const idToRemove = 2
        const expectedBookmarks = testBookmarks.filter(bm => bm.id !== idToRemove)
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/bookmarks`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedBookmarks)
          )
      })
    })
})

describe(`PATCH /api/bookmarks/:bookmark_id`, () => {
    context(`Given no bookmarks`, () => {
        it('responds with 404', () => {
            const bookmarkId = 123456
            return supertest(app)
                .patch(`/api/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404, { error: { message: `Bookmark Not Found` } })
        })
    })
    context(`Given there are bookmarks in the database`, () => {
        const testBookmarks = makeBookmarksArray()

        beforeEach('insert bookmarks', () => {
            return db
              .into('bookmarks')
              .insert(testBookmarks)
        })

        it(`responds with 204 and updates the article`, () => {
            const idToUpdate = 2
            const updateBookmark = {
                title: 'YouTube',
                url: 'https://www.youtube.com/',
                description: 'Video viewing platform for uploading and watching videos',
                rating: 5
            }
            const expectedBookmark = {
                ...testBookmarks[idToUpdate - 1],
                ...updateBookmark
            } 
            return supertest(app)
                .patch(`/api/bookmarks/${idToUpdate}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(updateBookmark)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/bookmarks/${idToUpdate}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(expectedBookmark)
                )
        })
    })
})