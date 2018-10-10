import modules

token = modules.get_access_token()
print(token)
#url = 'https://www.linkedin.com/in/shannonmullen/'
#url = 'www.linkedin.com'

#domain = 'www.jpmorganchase.com'
# first = 'Shannon'
# last = 'Mullen'

domain = 
first = 'Kristin'
last = 'Lemkau'


#result = modules.get_domain_search(token, domain)
result = modules.get_email_finder(token, domain, first, last)


print(result)



