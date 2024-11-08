import dataclasses
import json
import os
import requests
import time
import functools
from typing import List, Dict, Any, Tuple


# ===
# URL Content Grabber
# ===
@dataclasses.dataclass
class URLContent:
    title: str
    text: str
    error: str | None = None


def get_url_content(url: str) -> URLContent:
    headers: dict = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data: dict = {
        "url": url,
        "is_blog": True
    }
    response: requests.Response = requests.post('https://fun-readable-cd6ed9e43b50.herokuapp.com/convert', headers=headers, json=data)
    if response.status_code != 200:
        return URLContent(title="", text="", error=f"Error: {response.status_code}")
    try:
        content = response.json()
        return URLContent(**content)
    except ValueError as e:
        return URLContent(title="", text="", error=f"Error parsing response: {str(e)}")


url_grabber_tools = [{
    "type": "function",
    "function": {
        "name": "get_url_content",
        "description": "Retrieve and parse content from a given URL.",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "The URL from which to fetch the content."},
            },
            "required": ["url"]
        }
    }
}]

# ===
# Brave Search tool
# ===

@dataclasses.dataclass
class SearchResult:
  """
  Dataclass to represent the search results from Brave Search API.

  :param title: The title of the search result.
  :param url: The URL of the search result.
  :param description: A brief description of the search result.
  :param extra_snippets: Additional snippets related to the search result.
  """
  title: str
  url: str
  description: str
  extra_snippets: list

  def __str__(self) -> str:
    """
    Returns a string representation of the search result.

    :return: A string representation of the search result.
    """
    return (
        f"Title: {self.title}\n"
        f"URL: {self.url}\n"
        f"Description: {self.description}\n"
        f"Extra Snippets: {', '.join(self.extra_snippets)}"
    )



def search_brave(query: str, count: int = 10) -> list[SearchResult]:
    """
    Searches the web using Brave Search API and returns structured search results.

    :param query: The search query string.
    :param count: The number of search results to return.
    :return: A list of SearchResult objects containing the search results.
    """
    if not query:
        return []

    url: str = "https://api.search.brave.com/res/v1/web/search"
    headers: dict = {
        "Accept": "application/json",
        "X-Subscription-Token": os.environ.get('BRAVE_SEARCH_AI_API_KEY', '')
    }
    if not headers['X-Subscription-Token']:
        print("Error: Missing Brave Search API key.")
        return []

    params: dict = {
        "q": query,
        "count": count
    }

    retries: int = 0
    max_retries: int = 3
    backoff_factor: int = 2

    while retries < max_retries:
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()  # Raises an exception for HTTP errors
            results_json: dict = response.json()
            print('Got results')
            break
        except requests.exceptions.RequestException as e:
            print(f"HTTP Request failed: {e}, retrying...")
            retries += 1
            if retries < max_retries:
                time.sleep(backoff_factor ** retries)
            else:
                return []

    results: List[SearchResult] = []
    for item in results_json.get('web', {}).get('results', []):
        result = SearchResult(
            title=item.get('title', ''),
            url=item.get('url', ''),
            description=item.get('description', ''),
            extra_snippets=item.get('extra_snippets', [])
        )
        results.append(result)
    return results



brave_search_tools = [{
    "type": "function",
    "function": {
        "name": "search_brave",
        "description": "Search the web using Brave Search API and returns structured search results.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "the search query string."},
            },
            "required": ["query"]
        }
    }
}]


# ### Flow of the system
# 1. User asks a question => LLM -> Search Internet -> Results sent to another model -> decides if need to dig into the actual link -> return results and the additional information from the urls if digged deep 
# ===
# Main System
# ===

first_llm_system_prompt = '''
You are a language model. Your task is to answer the complex queries of the user. You can use brave search to search internet and get not just links and title and small description, but also a deep dive into the original content of certain pages.

You can perform multiple search requests with breakdown'd queries, and do multi-turn requests before answering the user's queries.
'''.strip()

second_llm_system_prompt = '''
You are a language model and your task is to look at the search results received from searching the internet for a user given query. You have to decide, whether the results need to be augmented with more information from actual webpage. If you do decide that you need to add more information for a certain result, you can call the tool.

Your final response back to the user should be a long compilation of the entire search result input and the content gathered from surfing webpages. Make sure that you include all the required information and additional related content that is mentioned.
'''.strip()

answer_checker_system_prompt = '''
You are a language model and your task is to evaluate the answer that is generated by another llm for the given user query. Check if the answer does answer the entire question or list of questions that the user is asking.

If you think answer is sufficient, then call return_answer_to_user tool, else if you think the answer needs some more information, then call the regenerate_answer tool with your suggestion as to how to modify the answer, and what else needs to be included.

You can only call one function at a time.

For answer sufficiency, look if the answer is appropriately answered. Look for sections which could benefit from further internet research. Sometimes the llm might just answer based on the one google search, you can ask the llm to research down another avenue to fulfill question. 
'''.strip()
answer_checker_tools = [
    {
        "type": "function",
        "function": {
            "name": "return_answer_to_user",
            "description": "This is function will return the current answer back to the user",
            "parameters": {}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "regenerate_answer",
            "description": "This function will send the suggestion back to the llm for modifications to the answer based on the user queries",
            "parameters": {
                "type": "object",
                "properties": {
                    "suggestion": {"type": "string", "description": "the suggestion for the llm"},
                },
                "required": ["suggestion"]
            }
        }
    }
]

import openai
from typing import List, Dict, Any

def ask_llm(messages: List[Dict[str, str]], tools: List[Dict[str, Any]] = None, tool_choice: str = 'auto') -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Ask the LLM a question and get a response.

    :param messages: List of message dictionaries
    :param functions: List of function definitions (optional)
    :return: LLM's response as a dictionary
    """
    response = openai.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=messages,
        tools=tools,
        tool_choice=tool_choice,
        max_tokens=4096,
        temperature=0.8
    )
    return response.choices[0].message, response.usage


@functools.lru_cache(maxsize=1024)
def process_user_query(query: str) -> str:
    """
    Process the user's query and return a response.

    :param query: User's question or query
    :return: Final response to the user
    """
    # Step 1: Ask LLM to formulate a search query
    history = [{'role': 'system', 'content': first_llm_system_prompt}]
    initial_message = {"role": "user", "content": query}
    history.append(initial_message)

    total_cost: float = 0.0
    total_input_tokens: int = 0
    total_cached_input_tokens: int = 0
    total_completion_tokens: int = 0

    while True:

        assistant_message, usage = ask_llm(history, brave_search_tools)
        history.append(assistant_message)

        total_input_tokens += usage.prompt_tokens
        total_cached_input_tokens += usage.prompt_tokens_details.cached_tokens
        total_completion_tokens += usage.completion_tokens

        input_cost = (usage.prompt_tokens - usage.prompt_tokens_details.cached_tokens) * (2.50 / 1_000_000)
        cached_input_cost = usage.prompt_tokens_details.cached_tokens * (1.25 / 1_000_000)
        output_cost = usage.completion_tokens * (10.00 / 1_000_000)
        current_cost = input_cost + cached_input_cost + output_cost
        total_cost += current_cost

        if assistant_message.tool_calls:
            if assistant_message.content:
                print(assistant_message.content)
            for function_call in assistant_message.tool_calls:
                args = json.loads(function_call.function.arguments)
                tool_call_response = {"role": "tool", "tool_call_id": function_call.id, "content": ""}
                if function_call.function.name == 'search_brave':
                    if 'query' in args:
                        search_result = search_brave(args['query'])
                        tool_call_response['content'] = json.dumps([dataclasses.asdict(x) for x in search_result], indent=2)
                    else:
                        tool_call_response['content'] = 'No query found in arguments'
                history.append(tool_call_response)
        else:
            print('LLM Generated Answer:')
            print(assistant_message.content)
            input_to_answer_checker = f'User query: {query}\n\nLLM Answer:\n{assistant_message.content}'
            answer_checker_history = [
                {'role': 'system', 'content': answer_checker_system_prompt},
                {'role': 'user', 'content': input_to_answer_checker},
            ]
            answer_checker_response, usage = ask_llm(answer_checker_history, answer_checker_tools, tool_choice='required')

            total_input_tokens += usage.prompt_tokens
            total_cached_input_tokens += usage.prompt_tokens_details.cached_tokens
            total_completion_tokens += usage.completion_tokens

            input_cost = (usage.prompt_tokens - usage.prompt_tokens_details.cached_tokens) * (2.50 / 1_000_000)
            cached_input_cost = usage.prompt_tokens_details.cached_tokens * (1.25 / 1_000_000)
            output_cost = usage.completion_tokens * (10.00 / 1_000_000)
            current_cost = input_cost + cached_input_cost + output_cost
            total_cost += current_cost

            function_call = answer_checker_response.tool_calls[0]
            if function_call.function.name == 'return_answer_to_user':
                cost_details: Dict[str, float] = {
                    "total_input_tokens_cost": (total_input_tokens - total_cached_input_tokens) * (2.50 / 1_000_000),
                    "total_cached_input_tokens_cost": total_cached_input_tokens * (1.25 / 1_000_000),
                    "total_completion_tokens_cost": total_completion_tokens * (10.00 / 1_000_000),
                    "total_cost": total_cost
                }
                return assistant_message.content, cost_details
            elif function_call.function.name == 'regenerate_answer':
                suggestion = json.loads(function_call.function.arguments).get('suggestion', '')
                print('LLM Suggestion:', suggestion)
                history.append({'role': 'user', 'content': suggestion})

# Example usage
if __name__ == "__main__":
    user_question: str = input("What's your question? ")
    response, cost_details = process_user_query(user_question)
    print(f"Response: {response}")
    print(f"Total cost: ${cost_details['total_cost']:.4f}")
    
    with open('response.md', 'w') as f:
        f.write(response)
        #f.write(f"\n\nTotal cost: ${cost_details['total_cost']:.4f}")
    
    with open('cost_details.json', 'w') as f:
        json.dump(cost_details, f, indent=2)



