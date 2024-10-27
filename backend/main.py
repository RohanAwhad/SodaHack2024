import streamlit as st
import researcher
import structured_llm_output
from structured_llm_output import Message
from pydantic import BaseModel, Field


class ProductNames(BaseModel):
    product_names_list: list[str] = Field(desc='10 product names based on the description provided', max_length=10, min_length=10)
class Domains(BaseModel):
    domains_list: list[str] = Field(desc='10 domains based on the product name provided', max_length=10, min_length=10)

# Function to get product names
def get_product_names(description: str) -> list[str]:
  messages = [Message('user', description),] 
  ret: ProductNames = structured_llm_output.run('gpt-4o-mini', messages, max_retries=3, response_model=ProductNames)
  return ret.product_names_list

# Function to get domain names
def get_domain_names(product_name: str) -> list[str]:
  messages = [Message('user', product_name),] 
  ret: Domains = structured_llm_output.run('gpt-4o-mini', messages, max_retries=3, response_model=Domains)
  return ret.domains_list

# Define the research function
def research_for_illegal_activities(domain: str) -> str:
  return researcher.process_user_query(f"was {domain} ever been involved in illegal activities? keep the answer concise.")
def research_for_product_offerings(domain: str) -> str:
  return researcher.process_user_query(f"If this domain '{domain}', was ever used, what was it used for? keep the answer concise.")

# Streamlit App
st.title("Product Domain Research Tool")

# Input for product description
description: str = st.text_input("Enter a product description")

# Generate product and domain names
if st.button("Search or Generate"):
  if description:
    with st.spinner('Generating Product Names'):
      product_names = get_product_names(description)
    for product_name in product_names:
      with st.expander(f"Product: {product_name}"):
        with st.spinner('Generating Domain Names'):
          domain_names = get_domain_names(product_name)
        for domain_name in domain_names:
          with st.spinner('Researching about this domain'): 
            illegal_activities_result = research_for_illegal_activities(domain_name)
            product_offerings_result = research_for_product_offerings(domain_name)
          st.write(f"Domain: {domain_name}")
          st.write(f"Illegal Activities: {illegal_activities_result[0]}")
          st.write(f"Product Offerings: {product_offerings_result[0]}")
  else:
    st.error("Please enter a product description.")


# remove streamlit dependency and write it as a main.py which basically just extends functions for others to import and call
# keep all the functionalities
