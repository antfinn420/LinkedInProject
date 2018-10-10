from selenium import webdriver


def main():

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

	# TODO: Setup the filters programmatically
	#//*[@id="ember830"]/div
	driver.find_element_by_xpath("""//*[@class="search-filter__button button--view-all-filters Sans-14px-black-75%-bold"]""").click()
	parent_element = driver.find_element_by_xpath("""//*[@data-nested-level="0"]""")
	#data-test-filter-code

	selectors = parent_element.find_elements_by_xpath(".//*[@data-test-filter-code]")

	i = 0
	for s in selectors:

		attr = s.get_attribute("data-test-filter-code")
		if (attr == "K"):
			inp = s.find_element_by_xpath(".//input")

			driver.implicitly_wait(20)
			#inp.send_keys("helloworld")

			driver.implicitly_wait(20)


			# method_list = [func for func in dir(inp) if callable(getattr(inp, func))]
			# print(method_list)
			#s.find_elements_by_xpath(".//input").type("HelloWorld")
			
		# method_list = [func for func in dir(s) if callable(getattr(s, func))]
		# print(method_list)



		i = i + 1
	print(i)



	#driver.close()



	#method_list = [func for func in dir(parent_element) if callable(getattr(parent_element, func))]





	#sections = parent_element.find_elements_by_tag_name("section")
	#sections = parent_element.find_elements_by_xpath('.//section')

	# for s in sections:
	# 	print(s)





	#children = parent_element.find_elements_by_xpath('.//*')




	# for c in children:
	# 	method_list = [func for func in dir(c) if callable(getattr(c, func))]
	# 	#print (method_list)
		





	#//*[@id="ember793"]/li[12]/button




	# TODO: initiate search


	#driver.find_element_by_xpath("""//*[@id="ember879"]""").click()







# def switch_filter(x):
#     return {
#         'K': setupKeyWords()#,
#         #'GE': 2,
#     }[x]


if __name__ == "__main__":
    main()
