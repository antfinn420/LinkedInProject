const getSearchListBlock = /<div id="browse_result_area"(.*?)<\/iframe><\/div><\/div><\/div><\/div><\/div><\/div><\/div><\/div><\/div>/i;
const getListPersonBlock = /<div class="clearfix _\S{3}">[\s\S]+?<iframe class="fbEmuTracking"/gi;
const getListPersonBlockV2 = /<div class="clearfix">[\s\S]+?<iframe class="fbEmuTracking"/gi;
const getListCompanyBlock = /<div class="clearfix _\S{3}">[\s\S]+?<iframe class="fbEmuTracking"/gi;

const getSearchListBlockV2 = /<div id="initial_browse_result"(.+)?<\/div><\/div><\/div><\/div>/i;
const getSearchListCompanies = /<div id="initial_browse_result">([\s\S]+?)<\/iframe><\/div><\/div><\/div><\/div><\/div><\/div><\/div>/i;

const getSearchListBlockV3 = /<div id="groupsMemberBrowserContent"(.+)?<\/div><\/div><\/div>/i;
const getListPersonBlockV3 = /<div class="clearfix _60rh _gse".*?>[\s\S]+?<\/div><\/div><\/div><\/div><\/div><\/div>/gi;

const regPeopleName = /data-testid="serp_result_link#\d+@EntRegularPersonalUser"><span.*>(.*?)<\/span>/i;
const regPeopleLink = /<div class=" "><a class="_.*?" href="(.*?)"/i;
const regPeopleLogo = /<img class="_\S{4} img" src="(.*?)"/i;

const regPeopleNameV3 = /<img.+?aria-label="(.+?)"/i;
const regPeopleLinkV3 = /href="(.*?profile\.php\?id=\d+)/i;
const regPeopleLinkV3_2 = /href="(.+?)\?/i;
const regPeopleLogoV3 = /<img class="_s0 _4ooo img" src="(.*?)"/i;

const regCompanyListName = /data-testid="serp_result_link#[0-9]+@EntConcreteOwnedPage"><span>(.*?)<\/span>/i;
const regCompanyListLink = /href="(.*?)" data-testid="serp_result_link#[0-9]+@EntConcreteOwnedPage"/i;
const regCompanyListLogo = /<img class="_\S{4} img" src="(.*?)"/i;

var maDefaultCompanyListId = 0;
var maDefaultPeopleListId = 0;

var personTemplate = $('#personTemplate').html();
var companyTemplate = $('#companyTemplate').html();

$body = $('body');
$peopleList = $('#peopleList');
$companiesList = $('#companiesList');
$countPeople = $('#countPeople');
$countSelectedPeople = $('#countSelectedPeople');
var $countCompanies = $('#countCompanies');

var currentCompanies = [];
var peopleList = [];

var people = [];
var companies = [];

if (chrome.tabs) {
  chrome.tabs.getSelected(null, function (tab) {

    maDefaultPeopleListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;
    maDefaultCompanyListId = (localStorage[LS_LastCompanyListId]) ? localStorage[LS_LastCompanyListId] : 0;

    chrome.tabs.sendMessage(tab.id, {
      method: 'getInnerHTML'
    }, function (response) {
      void 0;

      if (response) {
        if (tab.url.indexOf('/search/pages/') > 0 || tab.url.indexOf('/keywords_pages') > 0) {
          companies = getCompanyList(response.data);

          if (companies && (companies.length > 0)) {
            renderCompaniesList(companies);
            $('#companiesTabLink').tab('show');
          } else {
            $('#companiesTabLink').hide();
          }
        } else {
          people = parsePersonsV1(response.data);

          void 0;

          if (!people || (people.length === 0)) {
            people = parsePersonsV2(response.data);
            void 0;
          }

          if (!people || (people.length === 0)) {
            people = parsePersonsV3(response.data);
            void 0;
          }

          if (people && (people.length > 0)) {
            if (people && (people.length > 0)) {
              renderPeopleList(people);
              $('#peopleTabLink').tab('show');
            } else {
              $('#peopleTabLink').hide();
            }
          }
        }
      } else {
      }
    });
  });
}


function sendCompanies(e) {
  e.preventDefault();
  $(window).trigger('contactsSaving', [e]);

  var selectedLength = $companiesList.find('.js-list-item input:checked').length;

  if (companies) {
    var i = 0;
    $('#warning3').removeClass('hidden');
    for (var iNo = 0; iNo < companies.length; iNo++) {
      selected = $('#company_' + companies[iNo].source_id).find('input')[0].checked;
      if (selected) {

        getComp(companies[iNo], function (comp) {
          sendCompany(comp, function () {
            if (i == selectedLength - 1) {
              $('#warning3').addClass('hidden');
              $(window).trigger('contactsSaved', [e])
            }
            i++;
          });
        });
      }
    }
  } else {
    $(window).trigger('contactsSavingReset', [e]);
  }
}

function sendCompany(company, cb) {
  toggleStatusClass('#company_' + company.source_id, 'processing');

  var params = '';
  params = JSON.stringify(company);
  params = 'listId=' + maDefaultCompanyListId + '&list={"list": [' + encodeURIComponent(params) + ']}';

  var xhr = new XMLHttpRequest();
  xhr.open('POST', getMainHost() + '/api/createCompanyFacebook', true);

  xhr.overrideMimeType('text/xml');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      parseResponseCompanySearch(xhr.responseText, company);
    }
  }
  xhr.send(params);

  cb();
}

function sendCompanyA(companies, callback) {
  if (Array.isArray(companies)) {
    var params = 'noAuth=true&list={"list": ' + encodeURIComponent(JSON.stringify(companies) + '}');
  } else {
    var params = 'noAuth=true&list={"list": [' + encodeURIComponent(JSON.stringify(companies)) + ']}';
  }
  $.post(getMainHost() + '/api/createCompanyFacebook', params, function (response) {
    if (callback) {
      callback();
    }
  });
}


function sendPeopleDef(e) {
  e.preventDefault();
  $(window).trigger('contactsSaving', [e]);

  if (people) {
    var countSelected = 0;
    countSelected = $peopleList.find('.js-list-item input:checked').length;

    if (countSelected == 0) {
      $(window).trigger('contactsSavingReset', [e]);
      return undefined;
    }

    var bSent = false;
    var countSent = 0;

    $('#warning2').removeClass('hidden');

    for (var iNo = 0; iNo < people.length; iNo++) {
      var selected = $('#person_' + people[iNo].index_num).find('input')[0].checked;
      if (selected) {
        toggleStatusClass('#person_' + people[iNo].index_num, 'processing');
        getPerson(people[iNo], people.length * 500, function () {
          countSent++;
          if ((countSent >= countSelected) && !bSent) {
            bSent = true;
            setTimeout(sendCompanyA, 6000, currentCompanies, function () {
              setTimeout(sendPersonS, 3000, peopleList, function () {
                $('#warning2').addClass(' hidden');
                $(window).trigger('contactsSaved', [e]);
              });
            });
          }
        });
      }
    }
  } else {

    $(window).trigger('contactsSavingReset', [e]);
  }
}


function sendPersonS(list, cb) {
  void 0;
  var params = 'listId=' + maDefaultPeopleListId + '&list=' + encodeURIComponent(JSON.stringify(list));

  $.post(getMainHost() + '/api/createPeople', params, function (response) {

    if (response && response.result) {
      localStorage['needUpdateMA'] = 1;
    }

    cb();
  });
}


function renderPeopleList(people) {

  if (people) {
    for (var iNo = 0; iNo < people.length; iNo++) {
      if (people[iNo]) {
        _renderPerson(iNo);
      }
    }

    var $select = $('#userPeopleSelect');

    $select.on('change', function () {
      maDefaultPeopleListId = $select.val();
      localStorage[LS_LastPeopleListId] = maDefaultPeopleListId;
    });

    if (chrome.tabs) {
      $(window).on('userListsLoaded', function (event, type, data) {
        if (type === 'people') {
          showAvailableLists(data, 'userPeopleSelect', maDefaultPeopleListId);
          maDefaultPeopleListId = $select.val();
          localStorage[LS_LastPeopleListId] = maDefaultPeopleListId;
          checkPrevAddedPeople(people, data);
        }
      });
      getMAList('people', true);
    } else {
      showAvailableLists(maListJsonPeople, 'userPeopleSelect', maDefaultPeopleListId);
    }


    $('#sendPeople').on('click', sendPeopleDef);


    $countPeople.text(people.length);

    if (people.length > 2) {
      _addSelectAll('#peopleList');
    }
  } else {
    $countPeople.text('');
  }

}

function _renderPerson(iNo) {
  var person = people[iNo];
  if (person.name) {
    person.index_num = 'in' + iNo;

    var $person = $(personTemplate);
    $person.attr('id', 'person_' + person.index_num);

    var $checkbox = $person.find('[type="checkbox"]');
    $checkbox.val(person.index_num);

    $name = $person.find('.js-contact-name');
    $name.text(truncText(person.name, 23));

    var $image = $person.find('.js-contact-avatar > img');
    if (person.logo) {
      $image.attr('src', person.logo);
    } else {
      $image.attr('src', '../img/ghost_person.png');
    }
    $('#peopleList').append($person);
  }
}




function _renderCompany(iNo) {
  var company = companies[iNo];
  if (company.name) {
    var $company = $(companyTemplate);
    $company.attr('id', 'company_' + company.source_id)

    var $checkbox = $company.find('[type="checkbox"]');
    $checkbox.val(company.source_id);

    $name = $company.find('.js-contact-name');
    $name.text(truncText(company.name, 23));

    var $image = $company.find('.js-contact-avatar > img');
    if (company.logo) {
      $image.attr('src', company.logo);
    } else {
      $image.attr('src', '../img/ghost_company.png');
    }
    $('#companiesList').append($company);
  }
}


function renderCompaniesList(companies) {

  if (companies) {
    for (var iNo = 0; iNo < companies.length; iNo++) {
      if (companies[iNo]) {
        _renderCompany(iNo);
      }
    }

    var $select = $('#userCompaniesSelect');

    $select.on('change', function () {
      maDefaultCompanyListId = $select.val();
      localStorage[LS_LastCompanyListId] = maDefaultCompanyListId;
    });

    if (chrome.tabs) {
      $(window).on('userListsLoaded', function (event, type, data) {
        if (type === 'company') {
          showAvailableLists(data, 'userCompaniesSelect', maDefaultCompanyListId);
          maDefaultCompanyListId = $select.val();
          localStorage[LS_LastCompanyListId] = maDefaultCompanyListId;
          checkPrevAddedCompanies(companies, data);
        }
      });
      getMAList('company', true);

    } else {
      showAvailableLists(maListJsonCompany, 'userCompaniesSelect', maDefaultCompanyListId);
    }

    $('#sendCompanies').on('click', sendCompanies);

    $countCompanies.text(companies.length);

    if (companies.length > 0) {
      _addSelectAll('#companiesList');
    }
  } else {
    $countCompanies.empty();
  }
}



function getComp(data, callback) {

  if (data.source_page.indexOf('\/pages\/') === -1) {
    var getUrl = data.source_page + 'about/?ref=page_internal';

    $.get(getUrl, '', function (response) {
      getCompanyUrl(data.source_page, response, function (url, res) {
        var company = getCompanyInfo(res);

        company.url = url;

        if (company && company.name && company.source_id) {
          callback(company);
        }
      });

    });
  } else {
    var getUrl = data.source_page;

    $.get(getUrl, '', function (response) {
      var company = getPagesInfo(response);
      if (company && company.name && company.source_id) {
        callback(company);
      }
    });
  }

}

function getCompanyList(resource) {
  var list = [];
  var block = findDescr(resource, getSearchListCompanies);

  var listPersons = block.match(getListCompanyBlock);

  for (var index in listPersons) {
    var cmpn = getCompanyListInfo(listPersons[index]);
    if (cmpn.name) {
      list.push(cmpn);
    }

  }

  return list;
}

function getCompanyListInfo(source) {
  var company = {};

  company.name = findDescr(source, regCompanyListName).replace(/<span.*$/i, '');
  company.source_page = findDescr(source, regCompanyListLink).replace(/&ref=br_rs.*$/i, '').replace(/\?ref=br_rs.*$/i, '');
  company.logo = findDescr(source, regCompanyListLogo);
  company.source_id = findDescr(source, /data-profileid="(\d+?)"/i);
  company.source = 'facebook';
  void 0;
  return company;
}


function parseResponseCompanySearch(response, company) {
  var jsonObj = JSON.parse(response);
  if (jsonObj && jsonObj.result) {
    localStorage['needUpdateMA'] = 1;
    toggleStatusClass('#company_' + company.source_id, 'saved');
  } else {
    toggleStatusClass('#company_' + company.source_id, 'error');
  }
}


function parsePersonsV1(source) {
  var list = [];
  var block = findDescr(source, getSearchListBlock);
  var listPersons = block.match(getListPersonBlock);

  for (var index in listPersons) {
    var persn = getPersonInfo(listPersons[index]);

    if (persn) {
      list.push(persn);
    }
  }

  return list;
}

function parsePersonsV2(source) {
  var list = [];
  var block = findDescr(source, getSearchListBlockV2);

  var listPersons = block.match(getListPersonBlockV2);
  for (var index in listPersons) {
    var persn = getPersonInfo(listPersons[index]);
    if (persn) {
      list.push(persn);
    }

  }

  return list;
}

function parsePersonsV3(source) {
  var list = [];
  var block = findDescr(source, getSearchListBlockV3);

  var listPersons = block.match(getListPersonBlockV3);
  for (var index in listPersons) {
    var persn = getPersonInfoV3(listPersons[index]);
    if (persn) {
      list.push(persn);
    }

  }

  return list;
}

function getPersonInfoV3(source) {
  var person = {};

  void 0;

  person.name = findDescr(source, regPeopleNameV3);

  person.source_page = findDescr(source, regPeopleLinkV3);
  if (person.source_page) {
    person.source_id = findDescr(person.source_page, /id=(\d+)/i);
    person.source_id_2 = person.source_id;
  } else {
    person.source_page = findDescr(source, regPeopleLinkV3_2);
    if (person.source_page) {
      person.source_id_2 = findDescr(person.source_page, /com\/(.+)/i);
      person.source_id = findDescr(source, /data-profileid="(\d+?)"/i);
    }
  }

  person.logo = findDescr(source, regPeopleLogoV3);
  person.source = 'facebook';

  return person;
}

function getPersonInfo(source) {
  var person = {};

  person.name = findDescr(source, regPeopleName);

  person.logo = findDescr(source, regPeopleLogo);
  person.source = 'facebook';

  person.source_page = findDescr(source, regPeopleLinkV3);
  if (person.source_page) {
    person.source_id = findDescr(person.source_page, /id=(\d+)/i);
    person.source_id_2 = person.source_id;
  } else {
    person.source_page = findDescr(source, regPeopleLinkV3_2);
    if (person.source_page) {
      person.source_id_2 = findDescr(person.source_page, /com\/(.+)/i);
      person.source_id = findDescr(source, /data-profileid="(\d+?)"/i);
    }
  }

  return person;
}

function getPeopleCInfo(res) {


  var emails = res.match(regPeopleCInfoEmails);

  var cInfo = {};

  cInfo.e = [];

  for (var index in emails) {
    cInfo.e.push(decodeURIComponent(findDescr(emails[index], regPeopleCInfoEmail)));
  }

  var phones = res.match(regPeopleCInfoPhones);

  cInfo.p = [];

  var arr = {};

  for (var index in phones) {
    var type = findDescr(phones[index], regPeopleCInfoPhoneType).toLowerCase();
    if (type != 'mobile' && type != 'work' && type != 'home') {
      type = 'unknown';
    }
    arr[findDescr(phones[index], regPeopleCInfoPhone)] = type;
  }

  cInfo.p = arr;

  cInfo.u = {};

  var siteBlocks = res.match(regPeopleCInfoSiteBlocks);

  for (var index in siteBlocks) {
    cInfo.u[$('<div/>').html(findDescr(siteBlocks[index], regPeopleCInfoSiteBlock)).text()] = 'CUSTOM';
  }

  cInfo.i = {};

  var mBlocks = res.match(regPeopleCInfoMBlocks);

  for (var index in mBlocks) {
    cInfo.i[findDescr(mBlocks[index], regPeopleCInfoMBlockItem)] = findDescr(mBlocks[index], regPeopleCInfoMBlockType)
  }

  return cInfo;
}




function checkPrevAddedCompanies(companies, userLists) {
  var obj = {};
  obj.source = 'facebook';
  obj['list'] = [];
  $.each(companies, function (iNo, company) {
    obj['list'].push(company.source_id);
  });

  $.post(getMainHost() + '/api/getListsByCompaniesIds', obj, function (response) {
    if ((response.result) && (response.list)) {

      for (var resp in response.list) {
        toggleStatusClass('#company_' + resp, 'saved');
        var savedListName = getListNameById(userLists, response.list[resp]);
        $('#company_' + resp).addClass('saved__already').find('input').prop('checked', false);
        $('#company_' + resp).find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);
      }
    }
  });
}


function checkPrevAddedPeople(people, userLists) {
  var list = {};
  $.each(people, function (iNo, person) {
    var ids = ['', ''];
    if (person.source_id) {
      ids[0] = person.source_id;
    }
    if (person.source_id_2) {
      ids[1] = person.source_id_2;
    }
    list[person.index_num] = ids;
  });

  $.post(getMainHost() + '/api/getListsByPeoplesIds', list, function (response) {
    if ((response.result) && (response.list)) {
      for (var resp in response.list) {
        if (response.list[resp]['disabled']) {
          $('#person_' + resp).addClass('unsavable').prop('title', "This profile can not be saved due to owner's request").find('input').prop('checked', false).prop('disabled', true);
        } else {
          toggleStatusClass('#person_' + resp, 'saved');
          $('#person_' + resp).addClass('saved__already').find('input').prop('checked', false);

          var savedListName = getListNameById(userLists, response.list[resp]);
          $('#person_' + resp).addClass('saved__already').find('input').prop('checked', false);
          $('#person_' + resp).find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);
        }
      }
    }
  });

}


function _addSelectAll(selector) {
  var $selectAll = $('#selectAllTemplate').html();
  $(selector).prepend($selectAll);

  $(selector).on('change', '[name="selectAll"]', function () {
    var $checkbox = $(this);

    var $items = $checkbox.closest('section').find('.js-list-item');
    var state = $checkbox.is(':checked');

    $items.each(function () {
      $(this).find('input').prop('checked', state);
    });
  })
}



function getPerson(person, delay, cb) {
  if (person.source_page) {
    var profileLink = '';

    if (person.source_page.indexOf('?id=') !== -1) {
      profileLink = person.source_page + '&sk=about&section=education&pnref=about';
    } else {
      profileLink = person.source_page + '/about?section=education&pnref=about';
    }

    $.get(profileLink, '', function (response) {
      if (response) {

        var person2 = getPeopleInfo(response);

        if (person2 && person2.source_id && person2.name) {
          $.get(profileLink.replace('section=education', 'section=contact-info'), '', function (response) {
            person2.cInfo = getPeopleCInfo(response);

            if (person2.current && (person2.current.length > 0)) {
              for (var index in person2.current) {
                if (person2.current[index].source_page) {

                  if (person2.current[index].source_page.indexOf('"') !== -1) {
                    person2.current[index].source_page = person2.current[index].source_page.replace(/".*$/i, '');
                  }
                  if (person2.current[index].source_page.indexOf('pages/') === -1) {
                    getResponseCompanySearch(person2.current[index].source_page);
                  } else {
                    pagesProcessFunction(person2.current[index].source_page, person2, index);
                  }
                }
              }

              for (var index in person2.previous) {
                if (person2.previous[index].source_page) {

                  if (person2.previous[index].source_page.indexOf('"') !== -1) {
                    person2.previous[index].source_page = person2.previous[index].source_page.replace(/".*$/i, '');
                  }
                  if (person2.previous[index].source_page.indexOf('pages/') === -1) {
                    getResponseCompanySearch(person2.previous[index].source_page);
                  } else {
                    pagesProcessFunction(person2.previous[index].source_page, person2, index);
                  }
                }
              }

              peopleList.push(person2);
              setTimeout(toggleStatusClass, 5000, '#person_' + person.index_num, 'saved');
              if (cb) {
                delay = (delay < 2000) ? 2000 : delay;
                setTimeout(cb, delay);
              }
            } else {
              peopleList.push(person2);
              setTimeout(toggleStatusClass, 2600, '#person_' + person.index_num, 'saved');
              if (cb) {
                cb();
              }
            }
          }).fail(function (e) {
            void 0;
            toggleStatusClass('#person_' + person.index_num, 'error');
            cb();
          });
        } else {
          toggleStatusClass('#person_' + person.index_num, 'error');
          cb();
        }
      } else {
        toggleStatusClass('#person_' + person.index_num, 'error');
        cb();
      }
    });
  }
}

function pagesProcessFunction(link, person, index) {
  $.get(link, '', function (response) {
    var company = getPagesInfo(response);
    void 0;
    if (company && company.url) {
      currentCompanies.push(company);
    } else {
      if (company) {
        for (var iNo in peopleList) {
          if (peopleList[iNo].source_id === person.source_id) {
            company = getCompanyInfo(response);
            void 0;
            if (company && company.source_id && company.name) {
              peopleList[iNo].current[index].source_page = company.source_page;
              peopleList[iNo].current[index].source_id = company.source_id;
              currentCompanies.push(company);
            }
          }
        }
      }
    }
  });
}

function getResponseCompanySearch(sourcePage) {
  var regSlash = /\/$/i;
  var getUrl = sourcePage + (regSlash.test(sourcePage) ? '' : '/') + 'about/?ref=page_internal';

  $.get(getUrl, '', function (response) {
    getCompanyUrl(sourcePage, response, function (url, res) {
      var company = getCompanyInfo(res);

      company.url = url;

      if (company && company.name && company.source_id) {
        currentCompanies.push(company);
      }
    });

  });
}