from selenium import webdriver
from modules import save_session_ID
from modules import save_session_URL
from random import randint




chromedriverPath = executable_path=r"C:\LinkedInProject\chromedriver.exe"
driver = webdriver.Chrome(chromedriverPath)

driver.get("https://www.linkedin.com/")


userid = "Johnproctor112993@gmail.com"
password = "Neosight@2018"




driver.implicitly_wait(6)

driver.find_element_by_xpath("""//*[@id="login-email"]""").send_keys(userid)
driver.find_element_by_xpath("""//*[@id="login-password"]""").send_keys(password)
driver.find_element_by_xpath("""//*[@id="login-submit"]""").click()

#driver.get("{You connection profile link}") #Enter any of your connection profile Link
#connectionName = driver.find_element_by_class_name('pv-top-card-section__name').get_attribute('innerHTML')
#print(connectionName)


#//*[@id="ember864"]

driver.implicitly_wait(4)

driver.get("https://www.linkedin.com/sales/search/people")
#save_cookie(driver, r"C:\LinkedInProject\cookies\cookies.txt")

with open(r"C:\LinkedInProject\cookies\url.txt", "w") as f:
	f.write(driver.command_executor._url)	
with open(r"C:\LinkedInProject\cookies\session_id.txt", "w") as f:
	f.write(driver.session_id)



#f = open(r"C:\LinkedInProject\cookies\url.txt", "w")
#f = open(r"C:\LinkedInProject\cookies\url.txt", "w")





# print(driver.session_id)
# print(driver.command_executor._url)

# pickle.dump(driver.session_id, filehandler)
# pickle.dump(driver.command_executor._url, filehandler)






# save_session_URL(driver, r"C:\LinkedInProject\cookies\url.txt")
# save_session_ID(driver, r"C:\LinkedInProject\cookies\session_id.txt")

# Idea for future: go in and programmatically set the filters 


# TODO: Setup the filters programmatically
#//*[@id="ember830"]/div
# driver.find_element_by_xpath("""//*[@class="search-filter__button button--view-all-filters Sans-14px-black-75%-bold"]""").click()
# parent_element = driver.find_element_by_xpath("""//*[@data-nested-level="0"]""")
# #data-test-filter-code

# selectors = parent_element.find_elements_by_xpath(".//*[@data-test-filter-code]")







#i = 0
# for s in selectors:

# 	attr = s.get_attribute("data-test-filter-code")
# 	if (attr == "K"):
# 		inp = s.find_element_by_xpath(".//input")

		
# 		inp.send_keys("helloworld")

# 		#driver.implicitly_wait(20)


# 		# method_list = [func for func in dir(inp) if callable(getattr(inp, func))]
# 		# print(method_list)
# 		#s.find_elements_by_xpath(".//input").type("HelloWorld")