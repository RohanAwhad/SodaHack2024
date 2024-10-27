import researcher
import structured_llm_output
from structured_llm_output import Message
from pydantic import BaseModel, Field

class ProductNames(BaseModel):
  product_names_list: list[str] = Field(desc='product names based on the description provided', max_length=3, min_length=1)

class Domains(BaseModel):
  domains_list: list[str] = Field(desc='domain names like example.com based on the product name provided', max_length=3, min_length=1)


class IsIllegalActivity(BaseModel):
  is_illegal_activit_present: bool = Field(desc='based on the description of the domain provided, do you think there is any illegal activity associated with the domain name or similar domain name in question')

class DomainOfferings(BaseModel):
  offerings_list: list[str] = Field(desc='list of usecases/offerings mentioned in the research for that particular domain', max_length=5, min_length=3)


# Function to get product names
def get_product_names(description: str) -> list[str]:
  messages = [Message('user', description)] 
  ret: ProductNames = structured_llm_output.run('gpt-4o-mini', messages, max_retries=3, response_model=ProductNames)
  return ret.product_names_list

# Function to get domain names
def get_domain_names(product_name: str) -> list[str]:
  messages = [Message('user', product_name)] 
  ret: Domains = structured_llm_output.run('gpt-4o-mini', messages, max_retries=3, response_model=Domains)
  return ret.domains_list if ret else []

# Define the research function
def research_for_illegal_activities(domain: str, need_detailed_report: bool) -> dict[str, str | bool]:
  query = f"was {domain} ever been involved in illegal activities?"
  if not need_detailed_report: query += ' answer in 3-4 lines'
  illegal_activity_research = researcher.process_user_query(query)

  messages = [Message('user', illegal_activity_research[0])] 
  ret: IsIllegalActivity = structured_llm_output.run('gpt-4o-mini', messages, max_retries=3, response_model=IsIllegalActivity)
  if ret:
    return dict(illegal_activity=ret.is_illegal_activit_present, details=illegal_activity_research[0])
  else:
    return dict(illegal_activity=False, details=illegal_activity_research[0])

def research_for_product_offerings(domain: str) -> str:
  usecase_offering_research = researcher.process_user_query(f"If this domain '{domain}', was ever used, what was it used for? What was the usecase of the webpage at this domain")
  messages = [Message('user', usecase_offering_research[0])] 
  ret: DomainOfferings = structured_llm_output.run('gpt-4o-mini', messages, max_retries=3, response_model=DomainOfferings)
  return dict(domain_name=domain, use_case=ret.offerings_list if ret and ret.offerings_list else [])

def is_domain_available_for_purchase(domain: str) -> bool | None:
    import whois
    try:
        # Query the WHOIS information of the domain
        domain_info = whois.whois(domain)
        print(domain_info)
        # If domain_info is empty, the domain is available
        if not domain_info.domain_name:
            return True
        else:
            return False
    except Exception as e:
        print(e)
        return False
