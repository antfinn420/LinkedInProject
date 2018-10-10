import pickle
from selenium.common.exceptions import NoSuchElementException
from bs4 import BeautifulSoup 
import requests
import simplejson as json


def save_cookie(driver, path):
    with open(path, 'wb') as filehandler:
        pickle.dump(driver.get_cookies(), filehandler)

def load_cookie(driver, path):
     with open(path, 'rb') as cookiesfile:
                cookies = pickle.load(cookiesfile)
                for cookie in cookies:
                        driver.add_cookie(cookie)

def save_session_ID(driver, path):
        with open(path, 'wb') as filehandler:
                pickle.dump(driver.session_id, filehandler)
def save_session_URL(driver, path):
	with open(path, 'wb') as filehandler:
                pickle.dump(driver.command_executor._url, filehandler)


def check_exists_by_xpath(driver, xpath):
    try:
        driver.find_element_by_xpath(xpath)
    except NoSuchElementException:
        return False
    return True


def get_access_token():
    params = {
        'grant_type':'client_credentials',
        'client_id':'080a9366b0864069d8ed22de57a02475',
        'client_secret': '3497ccda6f8cdc76324b045ed6d6de28'
    }

    res = requests.post('https://app.snov.io/oauth/access_token', data=params)
    resText = res.text.encode('ascii','ignore')


    # response will be like this
    #bxXvDsQhR4TduWjOqaEOtQwSpd6Fafe4xwrilmV1


    return json.loads(resText)['access_token']


def get_domain_search(token, domain):
    #token = get_access_token()
    params = {'access_token':token,
            'domain':domain,
              'type': 'all',
              'limit': 100
    }

    res = requests.post('https://app.snov.io/restapi/get-domain-emails-with-info', data=params)
    #
    #
    # response will be like this
    #{u'domain': u'octagon.com', u'companyName': u'Octagon', u'webmail': False, u'limit': 100, u'result': 100, u'offset': 0, u'emails': [{u'status': u'verified', u'type': u'email', u'email': u'Emily.Hejlik@octagon.com'}, {u'status': u'verified', u'type': u'email', u'email': u'scott.brinser@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'franco.granello@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Raton33487OctagonShahumrick.shahum@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'anthony.garstang@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'gkamorine.adams@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'glamorine.adams@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'galexander@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'george.alexander@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'george@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'info.spain@octagon.com'}, {u'status': u'verified', u'type': u'email', u'email': u'Alicia@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'baseball@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'opportunities@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'mark.deleiburne@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'ausinfo@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'sginfo@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Aykan.Azar@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'germany@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'hola_spain@octagon.com'}, {u'status': u'verified', u'firstName': u'Tom', u'lastName': u'Gayner', u'sourcePage': u'https://uk.linkedin.com/pub/tom-gayner/54/640/2b', u'type': u'prospect', u'email': u'hello@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'recruitment@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'firstcall@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Basketball@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Entertainment@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'broadcast@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'coaches@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'football@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'golf@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'soccer@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'oas@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'wealthmanagement@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'speakers@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'tennis@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'BMWResortDrivingTour@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Symone.Cardoso@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'winnie.tsang@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'bessy.chan@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'eleana.leung@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'info@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'socar@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'race@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'maria.bellanca@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'yvonne.white@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'kathy.mak@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Aeroflot.info@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'heather.breen@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Lesley.Baker@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'annye.degrand@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Libby.peacock@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Stevie.Patnode@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'aitor.jimenez@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'kim.king@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'andy.bush@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'mireia.sola@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'kgaffney@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Kay.Gaffney@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'kay@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'jgarner@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Justin.Garner@octagon.com'}, {u'status': u'verified', u'type': u'email', u'email': u'justin@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'sgay@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Sherman.Gay@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'sherman@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'jgeary@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'jennifer.geary@octagon.com'}, {u'status': u'verified', u'type': u'email', u'email': u'jennifer@octagon.com'}, {u'status': u'verified', u'type': u'email', u'email': u'GGlashoff@octagon.com'}, {u'status': u'verified', u'firstName': u'Garrett', u'lastName': u'Glashoff', u'sourcePage': u'https://www.linkedin.com/pub/garrett-glashoff/2a/902/888', u'position': u'Account Executive', u'type': u'prospect', u'email': u'Garrett.Glashoff@octagon.com'}, {u'status': u'verified', u'type': u'email', u'email': u'garrett@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'bgoodman@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'Brittney.Goodman@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'brittney@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'lgordon@octagon.com'}, {u'status': u'notVerified', u'type': u'email', u'email': u'LESLIE.GORDON@octagon.com'},
    # {u'status': u'notVerified', u'type': u'email', u'email': u'leslie@octagon.com'},
    #  {u'status': u'notVerified', u'type': u'email', u'email': u'ngriffith@octagon.com'},
    #  ...other 97 elements
    # {u'status': u'notVerified', u'type': u'email', u'email': u'hunter@octagon.com'}]}
    #

    return json.loads(res.text)


def get_email_finder(token, domain, first, last):
    token = get_access_token()
    params = {'access_token':token,
              'domain':domain,
              'firstName': first,
              'lastName': last
    }

    res = requests.post('https://app.snov.io/restapi/get-emails-from-names', data=params)

    # response will be like this
    #{u'status': {u'identifier': u'complete', u'description': u'Emails search is completed'},
    # u'data': {u'lastName': u'vanrooyen', u'emails': [{u'email': u'gavin-vanrooyen@octagon.com', u'emailStatus': u'not_valid'}], u'firstName': u'gavin'},
    # u'params': {u'access_token': u'R2zDbvza563UVSsddsHfHhNHpMShU9exw70clLIE', u'lastName': u'vanrooyen', u'domain': u'octagon.com', u'firstName': u'gavin'}}

    return json.loads(res.text)