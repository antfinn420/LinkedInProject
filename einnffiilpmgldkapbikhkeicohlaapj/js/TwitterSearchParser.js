const REG_USER_BLOCK = /<div.+ProfileTimelineUser".*?>([\s\S]+?)<\/div>\n<\/div>\n*<\/div>/gi;
const REG_USER_SOURCE_ID_2 = /<a.*?fullname.*?href="\/(.+?)"/i;
const REG_USER_NAME = /<a.*?fullname.*?>\s*(.+?)</i;
const REG_USER_LOGO = /<img.+ProfileCard-avatarImage.*src="(.+?)"/i;

function getUserListFromSearch(source) {

    while (matches = REG_USER_BLOCK.exec(source)) {
        if (matches[1]) {
            var block = matches[1];
            var id = findDescrByRegEx(block, REG_USER_SOURCE_ID_2);
            if (id) {
                var user = {};
                user.source_id_2 = id;

                user.name = findDescrByRegEx(block, REG_USER_NAME);

                user.logo = findDescrByRegEx(block, REG_USER_LOGO);

                if (!users) {
                    var users = [];
                }              
                users.push(user);  
            }
        }
    }

    return users;
}