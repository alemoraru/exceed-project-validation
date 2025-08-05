export interface CodeSnippet {
    id: string;
    name: string;
    code: string;
    standardError: string;
}

export const codeSnippets: CodeSnippet[] = [
    {
        id: "snippetA",
        name: "list_index.py",
        code: `def get_item(items, index):
    return items[index]

my_list = [1, 2, 3]
result = get_item(my_list, 5)
print(result)`,
        standardError: `Traceback (most recent call last):
  File "list_index.py", line 5, in <module>
    result = get_item(my_list, 5)
  File "list_index.py", line 2, in get_item
    return items[index]
IndexError: list index out of range`
    },
    {
        id: "snippetB",
        name: "division_zero.py",
        code: `def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count

data = []
average = calculate_average(data)
print(f"Average: {average}")`,
        standardError: `Traceback (most recent call last):
  File "division_zero.py", line 7, in <module>
    average = calculate_average(data)
  File "division_zero.py", line 4, in calculate_average
    return total / count
ZeroDivisionError: division by zero`
    },
    {
        id: "snippetC",
        name: "key_error.py",
        code: `user_data = {
    "name": "Alice",
    "age": 30,
    "email": "alice@example.com"
}

def get_user_info(data, key):
    return data[key]

phone = get_user_info(user_data, "phone")
print(f"Phone: {phone}")`,
        standardError: `Traceback (most recent call last):
  File "key_error.py", line 10, in <module>
    phone = get_user_info(user_data, "phone")
  File "key_error.py", line 7, in get_user_info
    return data[key]
KeyError: 'phone'`
    },
    {
        id: "snippetD",
        name: "type_error.py",
        code: `def concatenate_strings(str1, str2):
    return str1 + str2

text = "Hello"
number = 42
result = concatenate_strings(text, number)
print(result)`,
        standardError: `Traceback (most recent call last):
  File "type_error.py", line 6, in <module>
    result = concatenate_strings(text, number)
  File "type_error.py", line 2, in concatenate_strings
    return str1 + str2
TypeError: can only concatenate str (not "int") to str`
    }
];

export const ollamaModels = [
    "deepseek-coder:6.7b",
    "llama3.2:3b",
    "llama3.1:8b",
    "codellama:7b"
];

export type ErrorMessageType = "pragmatic" | "contingent";

export const errorMessageTypes: ErrorMessageType[] = ["pragmatic", "contingent"];