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

function makeMaliciousBookmark() {
    const maliciousBookmark = {
      id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      url: 'https://www.hackers.com',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      rating: 1,
    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
}

module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark
}