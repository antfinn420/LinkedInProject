from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from modules import load_cookie
from modules import check_exists_by_xpath



##########################################################################################


# Get back to current driver setup initially (should be after filters and searched)


with open(r"C:\LinkedInProject\cookies\url.txt") as f:
    lines = f.readlines()
    driver_url = lines[0]


with open(r"C:\LinkedInProject\cookies\session_id.txt") as f:
    lines = f.readlines()
    session_id = lines[0]



driver = webdriver.Remote(command_executor=driver_url,desired_capabilities={})
driver.close()
driver.session_id = session_id

# Just to reinforce that its on the right tab
driver.switch_to.window(driver.window_handles[0])


##########################################################################################







##########################################################################################

# Get results into a list


# just to make sure the page is all loaded by scrolling through
driver.execute_script("var scroll_height = document.body.scrollHeight; window.scrollTo(0,scroll_height);") 


search_result_list = []
if (check_exists_by_xpath(driver, """//ol[@class="search-results__result-list"]/li""")):
    print('first')

    search_result_list.extend(driver.find_elements_by_xpath("""//ol[@class="search-results__result-list"]/li"""))
if (check_exists_by_xpath(driver, """//ol[@class="search-results__result-list"]/div/li""")):
    print('second')
    search_result_list.extend(driver.find_elements_by_xpath("""//ol[@class="search-results__result-list"]/div/li"""))

size = 0
for l in search_result_list:
    size = size + 1

print (size)

##########################################################################################










##########################################################################################

# Start Iterating through the list

rows = []

i = 0


while i < size:

    #search_result_list = driver.find_elements_by_xpath("""//ol[@class="search-results__result-list"]/li""")



    l = search_result_list[i]
    sales_link = l.find_element_by_xpath(""".//dt[@class="result-lockup__name"]/a""")
    #sales_link.click()


    ##########################
    # get full name 
    full_name = sales_link.text
    ##########################
    




    ##########################
    # go to sales link 

    sales_link_url = sales_link.get_attribute("href")
    
    driver.execute_script('''window.open("''' + sales_link_url + '''");''')

    driver.switch_to.window(driver.window_handles[1])

    ##########################






    ##########################
    # get associated data with each search result
    # and check for the elements on the page
    # (the bulk of the work is here)

    url = ''
    email = ''


    # get details option link
    if (check_exists_by_xpath(driver, """//div[@class="profile-topcard-actions__overflow relative ml1"]""")):
        
        three_buttons = driver.find_element_by_xpath("""//div[@class="profile-topcard-actions__overflow relative ml1"]""")

        three_buttons.click()

        # get profile link from details option
        if(check_exists_by_xpath(three_buttons, """//a[@data-control-name="view_linkedin"]""")):
            
            profile_link = three_buttons.find_element_by_xpath("""//a[@data-control-name="view_linkedin"]""")
            
            
            profile_link.click()
            driver.switch_to.window(driver.window_handles[2])

            url = driver.current_url


            if(check_exists_by_xpath(driver, """//a[@data-control-name="contact_see_more"]""")):
                
                #contact_info = driver.find_element_by_xpath("""//*[@class="pv-top-card-v2-section__links"]""")
                contact_info = driver.find_element_by_xpath("""//a[@data-control-name="contact_see_more"]""")
                contact_info.click()

                # if (check_exists_by_xpath(contact_info, """//section[@class="pv-contact-info__contact-type ci-vanity-url"]/div[@class="pv-contact-info__ci-container"]/a""")):
                #     url = contact_info.find_element_by_xpath("""//section[@class="pv-contact-info__contact-type ci-vanity-url"]/div[@class="pv-contact-info__ci-container"]/a""").text
                
                if (check_exists_by_xpath(contact_info, """//section[@class="pv-contact-info__contact-type ci-email"]/div[@class="pv-contact-info__ci-container"]/a""")):
                    email = contact_info.find_element_by_xpath("""//section[@class="pv-contact-info__contact-type ci-email"]/div[@class="pv-contact-info__ci-container"]/a""").text


                # TODO: make API call to snov.io
                # else:
                #     print (url)


            #############################
            # Readjust the windows

            driver.execute_script('''window.close();''')
            driver.switch_to.window(driver.window_handles[1])
            #############################


    ##############################




    ##########################
    # assemble the data

    # Setup row data
    row_data = [full_name, url, email]

    print(row_data)

    # Add to row list
    rows.append(row_data)
    
    #############################




    #############################

    # Readjust the windows

    driver.execute_script('''window.close();''')

    driver.switch_to.window(driver.window_handles[0])

    i = i + 1

    #############################


##########################################################################################







##########################################################################################

# Write out into CSV

headers = ['full_name','url','email']
headersString = ",".join(headers)


with open('test_demo.csv','w') as file:
    file.write(headersString)
    file.write('\n')
    for row in rows:
        rowString = ",".join(row)
        file.write(rowString)
        file.write('\n')


##########################################################################################









###############################################
# i = 0
# #for i in size:
# while i < size:


#     #testing iteration
#     # if (i != 0):
#     #     break
#     #l = driver.find_elements_by_xpath("""//ol[@class="search-results__result-list"]/li[""" + str(i) + """]""")
#     print(i)
#     search_result_list = driver.find_elements_by_xpath("""//ol[@class="search-results__result-list"]/li""")
#     l = search_result_list[i]


#     sales_link = l.find_element_by_xpath("""//dt[@class="result-lockup__name"]/a""")
#     full_name = sales_link.text
#     sales_link.click()    
#     #driver.find_element_by_xpath("""[class="profile-topcard-person-entity__name]"""
#     three_buttons = driver.find_element_by_xpath("""//div[@class="profile-topcard-actions__overflow relative ml1"]""")
#     three_buttons.click()

#     profile_link = three_buttons.find_element_by_xpath("""//a[@data-control-name="view_linkedin"]""")

#     profile_link.click()

#     driver.switch_to.window(driver.window_handles[1])

#     #contact_info = driver.find_element_by_xpath("""//*[@class="pv-top-card-v2-section__links"]""")
#     contact_info = driver.find_element_by_xpath("""//a[@data-control-name="contact_see_more"]""")
#     contact_info.click()

#     #url = contact_info.find_element_by_xpath("""//div[@class="pv-contact-info__ci-container"]/a""").text
#     url = contact_info.find_element_by_xpath("""//section[@class="pv-contact-info__contact-type ci-vanity-url"]/div[@class="pv-contact-info__ci-container"]/a""").text
#     email = contact_info.find_element_by_xpath("""//section[@class="pv-contact-info__contact-type ci-email"]/div[@class="pv-contact-info__ci-container"]/a""").text

#     driver.close()
#     driver.switch_to.window(driver.window_handles[0])


#     # Setup row data
#     row_data = [full_name, url, email]
#     # Add to row list
#     print(row_data)
#     rows.append(row_data)


#     driver.get(search_url)
#     i = i + 1



############################################





# i = 0
# for row in rows:
#     print(i)
#     print(row)
#     i = i + 1

# print(rows)


# print(url)
# print(email)

# headers = ['full_name','url','email']
# row_data = [full_name, url, email]
# headersString = ",".join(headers)
# rowString = ",".join(row_data)

# with open('test.csv','w') as file:
#     file.write(headersString)
#     file.write('\n')
#     file.write(rowString)
#     file.write('\n')


# l = currentList[0]



# sales_link = l.find_element_by_xpath("""//dt[@class="result-lockup__name"]/a""")
# full_name = sales_link.text
# print(full_name)

# sales_link.click()  


# #driver.find_element_by_xpath("""[class="profile-topcard-person-entity__name]"""
# three_buttons = driver.find_element_by_xpath("""//div[@class="profile-topcard-actions__overflow relative ml1"]""")
# three_buttons.click()

# profile_link = three_buttons.find_element_by_xpath("""//a[@data-control-name="view_linkedin"]""")

# profile_link.click()

# driver.switch_to.window(driver.window_handles[1])

# #contact_info = driver.find_element_by_xpath("""//*[@class="pv-top-card-v2-section__links"]""")
# contact_info = driver.find_element_by_xpath("""//a[@data-control-name="contact_see_more"]""")
# contact_info.click()

# #url = contact_info.find_element_by_xpath("""//div[@class="pv-contact-info__ci-container"]/a""").text
# url = contact_info.find_element_by_xpath("""//section[@class="pv-contact-info__contact-type ci-vanity-url"]/div[@class="pv-contact-info__ci-container"]/a""").text
# email = contact_info.find_element_by_xpath("""//section[@class="pv-contact-info__contact-type ci-email"]/div[@class="pv-contact-info__ci-container"]/a""").text

# driver.close()
# driver.switch_to.window(driver.window_handles[0])

# print(url)
# print(email)

# headers = ['full_name','url','email']
# row_data = [full_name, url, email]
# headersString = ",".join(headers)
# rowString = ",".join(row_data)

# with open('test.csv','w') as file:
#     file.write(headersString)
#     file.write('\n')
#     file.write(rowString)
#     file.write('\n')



#print(contact_info)

#contact_info.click()


# for l in currentList:
    

#   link = l.find_element_by_xpath("""//dt[@class="result-lockup__name"]/a""")


#   print(link)
#   link.click()



    # contents = container.find_elements_by_xpath(".//*")
    # for c in contents:
    #   c.click()
    #method_list = [func for func in dir(l) if callable(getattr(l, func))]
    #l.click()



    #print(l)




#driver.close()













#load_cookie(driver, r'C:\LinkedInProject\cookies\cookies.txt')





# is that it..?



#Idea for future: go in and programmatically set the filters 


# #TODO: Setup the filters programmatically
# #//*[@id="ember830"]/div
# driver.find_element_by_xpath("""//*[@class="search-filter__button button--view-all-filters Sans-14px-black-75%-bold"]""").click()
# parent_element = driver.find_element_by_xpath("""//*[@data-nested-level="0"]""")
# #data-test-filter-code

# selectors = parent_element.find_elements_by_xpath(".//*[@data-test-filter-code]")







# i = 0
# for s in selectors:

#   attr = s.get_attribute("data-test-filter-code")
#   if (attr == "K"):
#       inp = s.find_element_by_xpath(".//input")

        
#       inp.send_keys("helloworld")

#       #driver.implicitly_wait(20)


#       # method_list = [func for func in dir(inp) if callable(getattr(inp, func))]
#       # print(method_list)
#       #s.find_elements_by_xpath(".//input").type("HelloWorld")