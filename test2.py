from selenium import webdriver

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




#driver.find_element_by_xpath("""//*[@id="ember879"]""").click()

