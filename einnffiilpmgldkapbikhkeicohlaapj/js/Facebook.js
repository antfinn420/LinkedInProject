const regFacebookPeopleId = /"entity_id":"(\d+)"/i;
const regFacebookPeopleName = /<title id="pageTitle">(.*?)<\/title>/i;
const regGetUrl1 = /(https:\/\/www\.facebook\.com\/profile\.php\?id=\d+?)&/i;
const regGetUrl2 = /(https:\/\/www\.facebook\.com\/.*?)\//i;
const regTakeUrl2 = /https:\/\/www\.facebook\.com\/(.*?)\//i;
const regGetUrl3 = /(https:\/\/www\.facebook\.com\/.*?)\?/i;
const regGetUrl4 = /(https:\/\/www\.facebook\.com\/[a-z\d-\.]+)$/i;
const regTakeUrl4 = /https:\/\/www\.facebook\.com\/([a-z\d-\.]+)$/i;
const regTakeUrl3 = /https:\/\/www\.facebook\.com\/(.*?)\?/i;
const regWorkBlock = /<span role="heading" aria-level="5".*>(Work|Shaqo|Beroep|İş|Pekerjaan|Penggawean|Trabaho|Posao|Labour|Feina|Zaměstnání|Arbejde|Arbeit|Töö|Slavin'|ʞɹoʍ|Empleo|Ofico|Lana|Trabaho|Emploi|Wurk|Gollal|Arbeiði|Obair|Emprego|Tembiapo|Aiki|Posao|Akazi|Starf|Kazi|Travay|Kar|Darbs|Darbas|Officium|Robota|Δουλειά|Munkahely|Asa atao|Xogħol|Werk|Jobb|Arbeid|Ish sohasi|Praca|Trabalho|Serviciu|Tribagliu|Basa|Puna|Công việc|İş|Gure|Праца|სამუშაო|Работа|Жумушу|Жұмыс|Ажил|Посао|Кор|Робота|Աշխատանք|ⵜⴰⵡⵓⵔⵉ|ሥራ|काम|कार्य|কৰ্ম|কাজ|કાર્ય|କାର୍ଯ୍ୟ|வேலை|కార్యాలయం|ಕೆಲಸ|ജോലി|ที่ทำงาน|ບ່ອນເຮັດວຽກ|직장|工作經歷|工作|職歴)([\s\S]*?)<\/div><\/div><\/div><\/div><\/div><\/div><\/li><\/ul><\/div>/gi

const regFacebookPeopleAlias1 = /page_uri:"https:\/\/www\.facebook\.com\/profile\.php\?id=(\d+?)&/i;
const regFacebookPeopleAlias2 = /page_uri:"https:\/\/www\.facebook\.com\/(.*?)[\/|"]/i;
const regFacebookPeopleLink = /page_uri:"(https:\/\/www\.facebook\.com\/.*?)[\/|"]/i;
const regFacebookPeopleCountry = /\}\],user_country:"([A-Z]{2,3}?)",supported_types:\[/i;
const regFacebookPeopleImage = /<img class="_11kf img" alt=".*" src="(.*?)"/i;
const regFacebookPeopleJobsBlock = /<ul class="uiList fbProfileEditExperiences.*?>(.*?)<\/ul>/i;
const regFacebookPeopleJobsBlocks = /<li([\s\S]+?)<\/li>/gi;
const regFacebookPeoplePositionLink = /<a href="(.*?)"\s+data-hovercard/i;
const regFacebookPeoplePositionId = /data-hovercard="\/ajax\/hovercard\/page\.php\?id=(\d+)"/i;
const regFacebookPeoplePositionName = /<a.*?data-hovercard=.*?>(.*?)<\/a>/i;
const regFacebookPeoplePositionTitle = /<div class="fsm fwn fcg">([\s\S]+?)<\/div>/i;

const regFacebookCompanyFounded2 = /\.png" alt="" \/><\/div><div class="_[a-z\d]{4}"><div class="_[a-z\d]{4}">.*?,\s(\d{4})<\/div><\/div>/i;
const regFacebookCompanyFounded1 = /\.png" alt="" \/><\/div><div class="_[a-z\d]{4}"><div class="_[a-z\d]{4}">.*?\D\s(\d{4})<\/div><\/div>/i;
const regFacebookCompanyPhone = /\.png" alt="" \/><\/div><div class="_[a-z\d]{4}"><div class="_[a-z\d]{4}">\S+?\s([\+\d\s-]+?)<\/div><\/div>/i;
const regGetAliasCompanyPage = /https:\/\/www\.facebook\.com\/pg\/(.*?)\//i;
const regFacebookCompanyId = /"pageID":"(\d+?)"/i;
const regFacebookCompanyId2 = /page_uri:"https:\/\/www\.facebook\.com\/(.*?)\//i;
const regFacebookCompanyLogo = /"size":180,"uri":"(.*?)"/i;
const regFacebookCompanyIndustry = /keywords_pages\/\?ref=page_about_category">(.*?)<\/a>/i;
const regFacebookCompanyUrl = /page_uri:"(https:\/\/www\.facebook\.com\/(.*?))\//i;
const regFacebookBigCodeAbout = /<div class="hidden_elem"><code id=".{1,3}_.{1,3}_.{1,3}"><!--(.*class="clearfix".*?)--><\/code><\/div>/;
const regFacebookMainEmail = /mailto:(.*?)\?/i;

const REG_EMAILS = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;

const regPeopleCInfoPhones = /<li.*?><span dir="ltr">.*?<\/li><\/ul>/gi;
const regPeopleCInfoPhone = /<span dir="ltr">([\+\d\s-]+?)<\/span/i;
const regPeopleCInfoPhoneType = /<li>(\S+?)<\/li>/i;
const regPeopleCInfoEmails = /mailto:.*?"/gi;
const regPeopleCInfoEmail = /mailto:(.*?)"/i;
const regPeopleCInfoSiteBlocks = /<a.*?target="_blank".*?>.*?<\/a>/gi;
const regPeopleCInfoSiteBlock = /<a.*?target="_blank".*?>(.*?)<\/a>/i;
const regPeopleCInfoMBlocks = /<li>\S+?<\/li><li>\(.*?\)<\/li>/gi;
const regPeopleCInfoMBlockItem = /<li>(\S+?)<\/li><li>\(.*?\)<\/li>/i;
const regPeopleCInfoMBlockType = /<li>\S+?<\/li><li>\((.*?)\)<\/li>/i;

const regCompanyName = /"pageName":"(.*?)"/i;

const regPageUrl = /<input type="hidden" autocomplete="off" name="page_website_rendered" value="(.*?)" id="\S+?" \/>/i;
const regPageUrl2 = /;\);">(https?:\/\/.*?)<\/a>/i;
const regPageLogo = /<img class="scaledImageFitWidth img" src="(.*?)".*?\/>/i;
const regPagePhone = /<td class="_\S{4}">([+\d\s-]+?)<\/td>/i;
const regPageEmail = /href="mailto:(.*?)"/i;
const regPageName = /<h1>(.*?)<\/h1>/i;
const regPageIndustry = /"categoryName":"(.*?)",/i;
const regPageSourceId = /page_id:(\d+?),/i;
const regPageSourceId2 = /pages\/(.*?)\//i;
const regPageSourcePage = /page_uri:"(.*?)",/i;
const regPageTags = /<span class="_[\da-z-]+" id="\S+?"><span class="_\S{4}"><span class="_[\da-z-]+"><span class="_\S{4}"><span>.*?<\/span><\/span><span class="_[\da-z-]+"><i class="img sp_\S+ sx_\S+" id="\S+"><\/i><\/span><\/span><\/span><\/span>/gi;
const regPageTag = /<span class="_[\da-z-]+" id="\S+?"><span class="_\S{4}"><span class="_[\da-z-]+"><span class="_\S{4}"><span>(.*?)<\/span><\/span><span class="_[\da-z-]+"><i class="img sp_\S+ sx_\S+" id="\S+"><\/i><\/span><\/span><\/span><\/span>/i;
var regSlash = /\/$/i;

var maDefaultListId = 0;
var $userPeopleSelect = $('#userPeopleSelect');
var person = {};
var company = {};
var countAttemptsGetEmail = 0;

chrome.tabs.getSelected(null, function (tab) {
  addHeader();

  maDefaultListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;

  var parser = document.createElement('a');
  parser.href = tab.url;

  var hostname = parser.hostname;

  if (hostname && (hostname.indexOf('facebook.com') !== -1)) {
    if (parser.pathname.indexOf('search/') !== -1) {

    } else if (parser.href.indexOf('pages/') !== -1) {
      void 0;
      $.get(parser.href, '', function (response) {
        company = getPagesInfo(response);
        void 0;
        void 0;
        if (company && company.source_id && company.name) {
          sendCompany(company);
          showCompanyInfo(company);

          $(window).on('userListsLoaded', function (event, type, data) {

            showAvailableLists(data, 'userCompanyList', maDefaultListId);
            maDefaultListId = $('#userCompanyList').val();
            localStorage[LS_LastPeopleListId] = maDefaultListId;

          });
          getMAList('company', true);

          $('#sendCompany').on('click', sendCompanyCurrent);
        }
      });
    } else if (parser.href.indexOf('profile.php?id=') !== -1) {
      void 0;
      var id = findDescr(parser.href, /profile\.php\?id=(\d+)/i);
      var getUrl = 'https://www.facebook.com/profile.php?id=' + id + '&sk=about&section=education&pnref=about';
      $.get(getUrl, '', function (response) {
        person = getPeopleInfo(response);

        if (person && person.source_id && person.name) {
          saveCompany(person);

          $.get(getUrl.replace('section=education', 'section=contact-info'), '', function (response) {
            getCInfo(response);

            showPersonInfo(person);

            $(window).on('userListsLoaded', function (event, type, data) {
              $('#sendPerson').on('click', sendPerson);
              showAvailableLists(data, 'userPeopleSelect', maDefaultListId);
              maDefaultListId = $userPeopleSelect.val();
              localStorage[LS_LastPeopleListId] = maDefaultListId;

              checkPrevAddedPeople(person, data);
            });
            getMAList('people', true);
          });
        }
      });
    } else {
      void 0;
      var getUrl = parser.href;
      var companyAlias = '';

      if (getUrl.indexOf('/pg/') !== -1) {
        void 0;
        var alias = findDescr(getUrl, regGetAliasCompanyPage);
        if (alias) {
          getUrl = 'https://www.facebook.com/pg/' + alias + '/about/?ref=page_internal';

          $.get(getUrl, '', function (response) {

            getCompanyUrl(getUrl.replace('/about/?ref=page_internal', ''), response, function (url, res) {
              company = getCompanyInfo(res);
              company.url = url;

              if (company && company.source_id && company.name) {
                sendCompany(company);
                showCompanyInfo(company);

                $(window).on('userListsLoaded', function (event, type, data) {

                  showAvailableLists(data, 'userCompanyList', maDefaultListId);
                  maDefaultListId = $('#userCompanyList').val();
                  localStorage[LS_LastPeopleListId] = maDefaultListId;
                });
                getMAList('company', true);

                $('#sendCompany').on('click', sendCompanyCurrent);
              }
            });
          });
        }
      } else {
        void 0;
        if (regGetUrl1.test(getUrl)) {
          void 0;
          getUrl = findDescr(getUrl, regGetUrl1);
          getUrl += '&sk=about&section=education&pnref=about';

          $.get(getUrl, '', function (response) {
            person = getPeopleInfo(response);

            if (person && person.source_id && person.name) {
              saveCompany(person);

              $.get(getUrl.replace('section=education', 'section=contact-info'), '', function (response) {
                getCInfo(response);

                showPersonInfo(person);

                $(window).on('userListsLoaded', function (event, type, data) {
                  $('#sendPerson').on('click', sendPerson);
                  showAvailableLists(data, 'userPeopleSelect', maDefaultListId);
                  maDefaultListId = $userPeopleSelect.val();
                  localStorage[LS_LastPeopleListId] = maDefaultListId;

                  checkPrevAddedPeople(person, data);
                });
                getMAList('people', true);
              });
            }
          });
        } else if (regGetUrl2.test(getUrl)) {
          void 0;
          companyAlias = findDescr(getUrl, regTakeUrl2);

          if (companyAlias) {
            void 0;
            $.get('https://www.facebook.com/pg/' + companyAlias + '/about/?ref=page_internal', '', function (response) {

              getCompanyUrl(getUrl.replace('/about/?ref=page_internal', ''), response, function (url, res) {
                company = getCompanyInfo(res);
                company.url = url;

                if (company && company.source_id && company.name) {
                  sendCompany(company);
                  showCompanyInfo(company);

                  $(window).on('userListsLoaded', function (event, type, data) {

                    showAvailableLists(data, 'userCompanyList', maDefaultListId);
                    maDefaultListId = $('#userCompanyList').val();
                    localStorage[LS_LastPeopleListId] = maDefaultListId;
                  });
                  getMAList('company', true);

                  $('#sendCompany').on('click', sendCompanyCurrent);
                }
              });

            }).fail(function (e) {
              void 0;
              if (e.status === 404) {
                getUrl = findDescr(getUrl, regGetUrl2);
                getUrl += '/about?section=education&pnref=about';

                $.get(getUrl, '', function (response) {
                  person = getPeopleInfo(response);

                  if (person && person.source_id && person.name) {
                    saveCompany(person);

                    $.get(getUrl.replace('section=education', 'section=contact-info'), '', function (response) {
                      getCInfo(response);

                      showPersonInfo(person);

                      $(window).on('userListsLoaded', function (event, type, data) {
                        $('#sendPerson').on('click', sendPerson);
                        showAvailableLists(data, 'userPeopleSelect', maDefaultListId);
                        maDefaultListId = $userPeopleSelect.val();
                        localStorage[LS_LastPeopleListId] = maDefaultListId;
                        checkPrevAddedPeople(person, data);
                      });
                      getMAList('people', true);
                    });
                  }


                })
              }

            });
          }

        } else if (regGetUrl3.test(getUrl)) {
          void 0;
          companyAlias = findDescr(getUrl, regTakeUrl3);

          if (companyAlias) {
            void 0;
            $.get('https://www.facebook.com/pg/' + companyAlias + '/about/?ref=page_internal', '', function (response) {
              getCompanyUrl(getUrl.replace('/about/?ref=page_internal', ''), response, function (url, res) {
                company = getCompanyInfo(response, res);
                company.url = url;

                if (company && company.source_id && company.name) {
                  sendCompany(company);
                  showCompanyInfo(company);

                  $(window).on('userListsLoaded', function (event, type, data) {

                    showAvailableLists(data, 'userCompanyList', maDefaultListId);
                    maDefaultListId = $('#userCompanyList').val();
                    localStorage[LS_LastPeopleListId] = maDefaultListId;
                  });
                  getMAList('company', true);

                  $('#sendCompany').on('click', sendCompanyCurrent);
                }
              });
            }).fail(function (e) {
              void 0;
              if (e.status === 404) {
                getUrl = findDescr(getUrl, regGetUrl3);
                getUrl += '/about?section=education&pnref=about';
                $.get(getUrl, '', function (response) {
                  person = getPeopleInfo(response);

                  if (person && person.source_id && person.name) {
                    saveCompany(person);

                    $.get(getUrl.replace('section=education', 'section=contact-info'), '', function (response) {
                      getCInfo(response);
                      showPersonInfo(person);

                      $(window).on('userListsLoaded', function (event, type, data) {
                        $('#sendPerson').on('click', sendPerson);
                        showAvailableLists(data, 'userPeopleSelect', maDefaultListId);
                        maDefaultListId = $userPeopleSelect.val();
                        localStorage[LS_LastPeopleListId] = maDefaultListId;
                        checkPrevAddedPeople(person, data);
                      });
                      getMAList('people', true);
                    });
                  }

                })
              }

            });
          }
        } else if (regGetUrl4.test(getUrl)) {
          void 0;
          companyAlias = findDescr(getUrl, regTakeUrl4);

          if (companyAlias) {
            void 0;
            $.get('https://www.facebook.com/pg/' + companyAlias + '/about/?ref=page_internal', '', function (response) {
              getCompanyUrl(getUrl.replace('/about/?ref=page_internal', ''), response, function (url, res) {
                company = getCompanyInfo(res);
                company.url = url;

                if (company && company.source_id && company.name) {
                  sendCompany(company);
                  showCompanyInfo(company);

                  $(window).on('userListsLoaded', function (event, type, data) {

                    showAvailableLists(data, 'userCompanyList', maDefaultListId);
                    maDefaultListId = $('#userCompanyList').val();
                    localStorage[LS_LastPeopleListId] = maDefaultListId;
                  });
                  getMAList('company', true);

                  $('#sendCompany').on('click', sendCompanyCurrent);
                }
              });
            }).fail(function (e) {
              void 0;
              if (e.status === 404) {
                getUrl = findDescr(getUrl, regGetUrl4);
                getUrl += '/about?section=education&pnref=about';
                $.get(getUrl, '', function (response) {
                  person = getPeopleInfo(response);

                  if (person && person.source_id && person.name) {
                    saveCompany(person);

                    $.get(getUrl.replace('section=education', 'section=contact-info'), '', function (response) {

                      getCInfo(response);

                      showPersonInfo(person);
                      $(window).on('userListsLoaded', function (event, type, data) {
                        $('#sendPerson').on('click', sendPerson);
                        showAvailableLists(data, 'userPeopleSelect', maDefaultListId);
                        maDefaultListId = $userPeopleSelect.val();
                        localStorage[LS_LastPeopleListId] = maDefaultListId;

                        checkPrevAddedPeople(person, data);
                      });
                      getMAList('people', true);
                    });
                  }
                })
              }

            });
          }
        } else {
          void 0;
        }
      }
    }
  }


  $userPeopleSelect.on('change', function () {
    maDefaultListId = $(this).val();
    localStorage[LS_LastPeopleListId] = maDefaultListId;
  });
});

function saveCompany(people) {
  void 0;
  for (var key in people.current) {
    if (person.current[key].source_page) {
      getResponseCompany(key, 'current');
    }
  }

  for (var key in person.previous) {
    if (person.previous[key].source_page) {
      getResponseCompany(key, 'previous');
    }
  }
}

function getResponseCompany(key, part) {
  void 0;
  if (person[part][key].source_page.indexOf('pages/') === -1) {
    $.get('https://www.facebook.com/pg/' + findDescr(person[part][key].source_page, /https:\/\/www\.facebook\.com\/(.*?)$/i) + 'about/?ref=page_internal', '', function (res) {
      getCompanyUrl('https://www.facebook.com/pg/' + findDescr(person[part][key].source_page, /https:\/\/www\.facebook\.com\/(.*?)$/i), res, function (url, resp) {
        var cmpn = getCompanyInfo(resp);
        cmpn.url = url;
        sendCompany(cmpn);
      })
    });
  } else {
    void 0;
    $.get(person[part][key].source_page, '', function (response) {
      var companyPagesInfo = getPagesInfo(response);
      void 0;
      sendCompany(companyPagesInfo);
    });
  }

}

function getCompanyUrl(link, resource, cb) {
  var url = '';

  $.get(link, '', function (res) {
    url = findDescr(res, /website_url:"(.*?)"/i);
    cb(url, resource);
  });
}

function getPagesInfo(res) {
  var company = {};

  company.source_id = findDescr(res, /"uid":(\d+?),/i);
  if (!company.source_id) {
    return undefined;
  }

  void 0;

  if (res.indexOf('PagesVertexInfoPageletController_' + company.source_id) === -1) {
    return company;
  }

  company.url = findDescr(res, regPageUrl);
  if (!company.url) {
    company.url = findDescr(res, regPageUrl2);
  }
  company.logo = findDescr(res, regPageLogo);

  if (company.logo && (company.logo.length > 255)) {
    company.logo = '';
  }

  company.phone = findDescr(res, regPagePhone);

  company.emails = [];

  var MainEmail = $('<div/>').html(findDescr(res, regPageEmail)).text();

  if (MainEmail) {
    company.emails.push(MainEmail);
  }


  company.name = findDescr(res, regPageName);

  company.source = 'facebook';

  company.industry = findDescr(res, regPageIndustry);
  company.source_page = decodeURIComponent(findDescr(res, regPageSourcePage));
  company.source_id_2 = decodeURIComponent(findDescr(company.source_page, regPageSourceId2));

  return company;
}

function getCInfo(res) {

  var emails = res.match(regPeopleCInfoEmails);

  person.cInfo = {};

  person.cInfo.e = [];

  for (var index in emails) {
    person.cInfo.e.push(decodeURIComponent(findDescr(emails[index], regPeopleCInfoEmail)));
  }

  var phones = res.match(regPeopleCInfoPhones);

  person.cInfo.p = [];

  var arr = {};

  for (var index in phones) {
    var type = findDescr(phones[index], regPeopleCInfoPhoneType).toLowerCase();
    if (type != 'mobile' && type != 'work' && type != 'home') {
      type = 'unknown';
    }
    arr[findDescr(phones[index], regPeopleCInfoPhone)] = type;
  }

  person.cInfo.p = arr;

  person.cInfo.u = {};

  var siteBlocks = res.match(regPeopleCInfoSiteBlocks);

  for (var index in siteBlocks) {
    person.cInfo.u[$('<div/>').html(findDescr(siteBlocks[index], regPeopleCInfoSiteBlock)).text()] = 'CUSTOM';
  }

  person.cInfo.i = {};

  var mBlocks = res.match(regPeopleCInfoMBlocks);

  for (var index in mBlocks) {
    person.cInfo.i[findDescr(mBlocks[index], regPeopleCInfoMBlockItem)] = findDescr(mBlocks[index], regPeopleCInfoMBlockType)
  }
}

function showPersonInfo(person) {
  var $personInfoBody = $('#personInfoBody');

  $('#peopleFunctionalityBlock').show();

  function appendData(data, selector) {
    var $el = $personInfoBody.find(selector);
    if (data && $el) {
      $el.append(data);
    }
  }

  var $image = $personInfoBody.find('.js-contact-avatar > img');

  if (person.logo) {
    $image.attr('src', person.logo);
  } else {
    $image.attr('src', '../img/ghost_person.png');
  }

  appendData(person.name, '.js-contact-name');
  appendData(person.description, '.js-contact-description');
  if (person.current && person.current[0]) {
    appendData(person.current[0].company_name, '.js-contact-info');
  }
  $personInfoBody.find('.media').removeClass('hidden');
}


function sendPerson(e) {
  e.preventDefault();
  $(window).trigger('contactsSaving', [e]);
  toggleStatusClass('#personMedia', 'processing');

  var params = 'listId=' + maDefaultListId + '&list=[' + encodeURIComponent(convertHtmlToText(JSON.stringify(person))) + ']&linkedinParser=1';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', getMainHost() + '/api/createPeople', true);
  xhr.overrideMimeType('text/xml');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      parseResponsePerson(xhr.responseText);
      $(window).trigger('contactsSaved', [e])
    }
  }
  xhr.send(params);
}


function parseResponsePerson(response) {
  var jsonObj = JSON.parse(response);
  if (jsonObj && jsonObj.result) {
    localStorage['needUpdateMA'] = 1;
    toggleStatusClass('#personInfoBody > .media', 'saved');

    setTimeout(getPersonEmails, 2000, person);
  } else {
    toggleStatusClass('#personInfoBody > .media', 'error');
    if (jsonObj && jsonObj.message) {
      document.getElementById('errorMessagePerson').innerText = jsonObj.message;
      show(document.getElementById('errorMessagePerson'));
    }
  }
}

function getPersonEmails(person) {
  if (person && person.source_id_2) {
    $.post(getMainHost() + '/api/getPeopleContacts', 'sourceId2=' + person.source_id_2, function (response) {
      if (response.result) {
        if ((response.result == 2) || ((response.result == 3) && !response.contacts)) {
          countAttemptsGetEmail++;
          if (countAttemptsGetEmail < 10) {
            setTimeout(getPersonEmails, 2000, person);
          } else {
            showEmails('empty result');
          }
        } else {
          if (response.contacts) {
            $('#emailsBlock').removeClass('hidden');
            showEmails(response.contacts);
          }
        }
      }
    });
  }
}


function sendCompany(company) {

  var params = 'noAuth=true&list={"list": [' + encodeURIComponent(JSON.stringify(company)) + ']}';
  $.post(getMainHost() + '/api/createCompanyFacebook', params, function (response) {
    void 0;
  });

}

function sendCompanyCurrent(e) {
  e.preventDefault();
  $(window).trigger('contactsSaving', [e]);
  toggleStatusClass('#companyInfoBody', 'processing');

  var params = 'listId=' + maDefaultListId + '&list={"list": [' + encodeURIComponent(JSON.stringify(company)) + ']}';

  var xhr = new XMLHttpRequest();
  xhr.open('POST', getMainHost() + '/api/createCompanyFacebook', true);
  xhr.overrideMimeType('text/xml');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      parseResponseCompany(xhr.responseText);
      $(window).trigger('contactsSaved', [e])
    }
  }
  xhr.send(params);
}

function parseResponseCompany(response) {

  var jsonObj = JSON.parse(response);
  if (jsonObj && jsonObj.result) {
    localStorage['needUpdateMA'] = 1;
    toggleStatusClass('#companyInfoBody > .media', 'saved');
  } else {
    toggleStatusClass('#companyInfoBody > .media', 'error');
    if (jsonObj && jsonObj.message) {
      document.getElementById('errorMessageCompany').innerText = jsonObj.message;
      show(document.getElementById('errorMessageCompany'));
    }
  }
}

function showEmails(response) {
  var $emails = $('#emails');
  if (response && (response !== 'empty result')) {
    var emails = [];
    emails = response;
    if (emails.length > 0) {
      $emails.append(emails.join('<br>'));
    }
  } else {
    $emails.append('Can\'t find emails');
  }
  $emails.removeClass('hidden');
  $emails.style = 'opacity: 1!important';
  toggleStatusClass('#emailsBlock', 'hidden');
}

function checkPrevAddedPeople(person, userLists) {
  var list = {};
  var ids = ['', ''];
  if (person.source_id) {
    ids[0] = person.source_id;
  }
  if (person.source_id_2) {
    ids[1] = person.source_id_2;
  }
  list[0] = ids;

  $.post(getMainHost() + '/api/getListsByPeoplesIds', list, function (response) {

    if (response.result && response.list && (response.list.length > 0)) {
      if (response.list[0]['disabled']) {
        $('#personInfoBody > .media').addClass('unsavable').prop('title', "This profile can not be saved due to owner's request");
        $('#sendPerson').attr('disabled', true);
      } else {
        toggleStatusClass('#personInfoBody > .media', 'saved');
        var savedListName = getListNameById(userLists, response.list[0]);

        $('#personInfoBody > .media').find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);

        getPersonEmails(person);
      }
    }
  });
}

function getCompanyInfo(source) {

  var company = {};

  var aboutContent = findDescr(source, regFacebookBigCodeAbout);

  company.emails = aboutContent.match(REG_EMAILS);

  company.phone = findDescr(aboutContent, regFacebookCompanyPhone);

  if (regFacebookCompanyFounded1.test(aboutContent)) {
    company.founded = findDescr(aboutContent, regFacebookCompanyFounded1);
  } else if (regFacebookCompanyFounded2.test(aboutContent)) {
    company.founded = findDescr(aboutContent, regFacebookCompanyFounded2);
  } else {
    company.founded = '';
  }

  if (company.emails === null) {
    company.emails = [];
  }

  var MainEmail = $('<div/>').html(findDescr(aboutContent, regFacebookMainEmail)).text();

  if (MainEmail) {
    company.emails.push(MainEmail);
  }

  var blocks = source.match(/src="https:\/\/static\.xx\.fbcdn.net\/rsrc\.php\/\S+\.png" alt="" \/><\/div><div class="_\S{4}">.*?<\/div><\/div><div/gi);
  var arrContacts = [];

  for (var i in blocks) {
    var obj = {};

    obj.img = findDescr(blocks[i], /src="(.*?)" alt="" \/><\/div><div class="_\S{4}">.*?<\/div/i);
    obj.data = findDescr(blocks[i], /src="https:\/\/static\.xx\.fbcdn.net\/rsrc\.php\/\S+\.png" alt="" \/><\/div><div class="_\S{4}">(.*?)<\/div><\/div>/i).replace('</div><div>', '||');

    arrContacts.push(obj);
  }

  company.dataS = arrContacts;

  company.name = JSON.parse('"' + findDescr(source, regCompanyName) + '"');
  company.source_id = findDescr(source, regFacebookCompanyId);
  company.source_id_2 = decodeURIComponent(findDescr(source, regFacebookCompanyId2));
  company.source = 'facebook';
  company.logo = JSON.parse('"' + findDescr(source, regFacebookCompanyLogo) + '"');
  company.industry = findDescr(source, regFacebookCompanyIndustry);
  company.source_page = decodeURIComponent(findDescr(source, regFacebookCompanyUrl));

  void 0;
  return company;
}

function showCompanyInfo(company) {
  var $companyInfoBody = $('#companyInfoBody');

  $('#companyFunctionalityBlock').show();

  function appendData(data, selector) {
    var $el = $companyInfoBody.find(selector);
    if (data && $el) {
      if (!$el.is(':empty')) {
        $el.append(' • ');
      }
      $el.append(data);
    }
  }

  var $image = $companyInfoBody.find('.js-contact-avatar > img');

  if (company.logo) {
    $image.attr('src', company.logo);
  } else {
    $image.attr('src', '../img/ghost_company.png');
  }

  appendData(company.name, '.js-contact-name');
  appendData(company.industry, '.js-contact-description');
  appendData(company.type, '.js-contact-info');
  appendData(company.city, '.js-contact-info');

  $companyInfoBody.find('.media').removeClass('hidden');
}


function getPeopleInfo(source) {
  var people = {};

  people.source = 'facebook';

  people.fullInfo = 1;

  people.name = JSON.parse('"' + findDescr(source, regFacebookPeopleName) + '"');
  people.name = findDescr(source, regFacebookPeopleName);
  people.source_id = findDescr(source, regFacebookPeopleId);

  if (regFacebookPeopleAlias1.test(source)) {
    people.source_id_2 = findDescr(source, regFacebookPeopleAlias1);
  } else if (regFacebookPeopleAlias2.test(source)) {
    people.source_id_2 = findDescr(source, regFacebookPeopleAlias2);
  } else {
    people.source_id_2 = null;
  }

  people.source_page = findDescr(source, regFacebookPeopleLink);

  if (!people.source_page) {
    people.source_page = 'https://www.facebook.com/' + people.source_id_2;
  }

  if (people.source_id === people.source_id_2) {
    people.source_page = 'https://www.facebook.com/profile.php?id=' + people.source_id;
  }

  people.country = findDescr(source, regFacebookPeopleCountry);
  people.logo = findDescr(source, regFacebookPeopleImage);

  var workBlock = source.match(regWorkBlock);
  people.previous = [];
  people.current = [];

  if (workBlock) {
    var positionBlocks = workBlock[0].match(regFacebookPeopleJobsBlocks);

    for (var i in positionBlocks) {
      var titleString = findDescr(positionBlocks[i], regFacebookPeoplePositionTitle);
      void 0;
      var title = '';
      var isCurrent = false;

      if (titleString) {
        var test1 = titleString.match(/\d{4}/gi);

        if (!test1) {
          isCurrent = true;
        } else {
          if (test1.length !== 2) {
            var arr = titleString.split(" · ");
            title = arr[0].replace('<span role="presentation" aria-hidden="true">', '');

            if (arr[1]) {
              var test = arr[1].match(/\d{4}/gi);

              if (test) {
                if (arr.length === 2) {
                  if ((/\d{4}/i).test(arr[1]) && (test.length === 1)) {
                    isCurrent = true;
                  }
                } else if (test.length === 1) {
                  isCurrent = true;
                }
              } else {
                isCurrent = true;
              }
            } else {
              isCurrent = true;
            }
          }
        }

      } else {
        isCurrent = true;
      }

      var sourcePage = $('<div/>').html(decodeURIComponent(findDescr(positionBlocks[i], regFacebookPeoplePositionLink))).text();
      void 0;
      var regCheckForEmptyPage = /\/\d+$/i;
      var obj = {
        source: 'facebook',
        position: title,
        company_name: $('<div/>').html(findDescr(positionBlocks[i], regFacebookPeoplePositionName)).text(),
        source_page: sourcePage,
        source_id: findDescr(positionBlocks[i], regFacebookPeoplePositionId)
      };

      void 0;
      if (isCurrent) {
        people.current.push(obj);
      } else {
        people.previous.push(obj);
      }

    }
  }

  void 0;

  return people;
}

function findDescr(source, reg) {
  var sTemp = '';
  var fnd = source.match(reg);
  if ((fnd) && (fnd.length > 1)) {
    sTemp = fnd[1];
    sTemp = sTemp.trim();
    sTemp = sTemp.replace(/<b>/g, '');
    sTemp = sTemp.replace(/<\/b>/g, '');
    sTemp = sTemp.replace(/&amp;/gi, '&');
    return sTemp;
  } else {
    return '';
  }
}