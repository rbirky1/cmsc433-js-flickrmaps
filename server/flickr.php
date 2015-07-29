<?

# Edit the following line to contain your API key.
# You can obtain a flickr API key here...
# http://www.flickr.com/services/api/keys/apply/
define(API_KEY, 'bbe1e059a5f7264835df83f048ec8792');

header("Content-type: application/json; charset=utf-8");
header("Pragma: no-cache");
header("Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0");

# For details of endpoint see...
# http://www.flickr.com/services/api/flickr.photos.search.html
print file_get_contents(
    'https://api.flickr.com/services/rest/' .
    '?method=flickr.photos.search' .
    '&api_key=' . API_KEY .
    '&user_id=' . $_GET['user_id'] .
    '&text=' . $_GET['text'] .
    '&bbox=' . $_GET['bbox'] .
    '&extras=geo' .
    '&format=json' .
    '&nojsoncallback=1' .
    '&accuracy=1'
);

?>
