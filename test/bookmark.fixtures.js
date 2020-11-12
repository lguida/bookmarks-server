function makeBookmarksArray(){
    return [
        {
            id: 1,
            title: 'Google',
            url: 'https://www.google.com/',
            description: 'Primary search engine',
            rating: 5
        },
        {
            id: 2,
            title: 'Google Translate',
            url: 'https://translate.google.com/',
            description: 'Google translation tool',
            rating: 3
        },
        {
            id: 3,
            title: 'Facebook',
            url: 'https://www.facebook.com/',
            description: 'Facebook homepage, social media platform',
            rating: 1 
        },
        {
            id: 4,
            title: 'Instagram',
            url: 'https://www.instagram.com/',
            description: 'Instagram homepage, social media platform',
            rating: 5
        }
    ]
}

module.exports = {
    makeBookmarksArray, 
}