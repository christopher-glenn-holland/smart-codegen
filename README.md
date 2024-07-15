# Smart-CodeGen
## Purpose
This is a chat-based application designed to facilitate Chat-Oriented Programming

## Setup
### Docker
- Copy docker-compose.yml.example to docker-compose.yml
  - Update **backend** service 
    - Find the **volumes** section. Uncomment the section that covers your operating system
      - For a Windows user named John Doe that keeps all his projects in a folder called 'myrepos' under his account name he would set volumes as
      - /c/users/jdoe/myrepos:repos
     - Find the **OPEN_API_KEY** variable under **environment** and set your api key here 
     - Find the **CONTEXT_TEXT** variable under **environment**
       - This is one of the most important parts to the project. This text is sent with your API call on each send. You can attempt to optimize it or add your own hints to it. If the application starts acting poorly, restore the original text and try again.
- **To run**
  - docker-compose up --build
- **Troubleshooting** 
  - Steps to resolve volume errors if you have successfully built the container prior
    1. docker-compose down --volumes --remove-orphans
    2. docker system prune -a -f
    3. docker-compose up --build

### Web
- The web frontend runs on port 3999 by default

### WebAPI
- The web api runs on port 5999 by default

## Usage

### TLDR
You can select files from the file tree, upload files, and enter requests into the text box. All relevant context will be included when you send your request.

If your request involves updating code, GPT will return the responses as code files. These files can then be written to your file system using the write buttons. As long as you write the files to your file system and ensure they are checked in the file tree, they will be included in subsequent requests. This process allows you to iterate with the GPT multiple times to complete your coding project.

### Select a project folder to work on
A good indication that the application is working is if you see a list of folders when you click the 'Select a folder' drop-down. This means the Python application has successfully found your root repository folder. Each folder in the drop-down should represent a separate project. Once you select a project, you will see files in the file tree.

![ListOfProjects](https://github.com/user-attachments/assets/74661a80-97c0-48d9-9965-3ae959fde456)

### Sending files as context
Any file selected in the tree will be included in the context sent to the GPT API. While providing more relevant context can improve GPT's performance, sending unrelated files may not be helpful, can slow down the process, and increase costs.

![ProjectFileList](https://github.com/user-attachments/assets/8f9868aa-7c00-4b7e-beb9-9b11caf14005)

### Refresh Wheels
There are two refresh buttons: a blue wheel and a green wheel. The blue wheel refreshes the project listed in the drop-down menu. The green wheel refreshes the files in the tree, which is useful if you manually add or delete a file.

![RefreshWheels](https://github.com/user-attachments/assets/488e7148-6131-4474-bd38-f9142e6db835)

### Download Context
This feature is useful when you want to review all the data that will be sent to GPT. This includes all the files selected in the tree, any uploaded files, and the text you’ve typed in the chat dialog. It's also handy if you want to consolidate all your code into a single file, which you can then upload to the ChatGPT website or another GPT platform.

![DownloadContext](https://github.com/user-attachments/assets/ad81301b-ed42-4f46-9693-f8581d05eade)

### Totals
This keeps track of your estimated spend calling the GPT.

![Totals](https://github.com/user-attachments/assets/cb827c02-516a-48bf-8f72-16a3ba876b3b)

### Write Changes
When you receive a response from GPT, it will attempt to split the response into files. You can write each file individually to the file system using **Write Change**, or press **Write All Changes** to write all files at once. If you encounter anomalies when using **Write All Changes**, try writing each file individually with **Write Change** instead.

![WriteChanges](https://github.com/user-attachments/assets/3937460f-cbf1-4591-ab01-b775af456229)

## What are tokens
In ChatGPT 4o-mini, a token can be as short as one character or as long as one word. Here's a basic overview of what constitutes a token:

    Single Characters: Each character, such as punctuation or a single letter, counts as one token. For example:
        "A" (1 token)
        "," (1 token)

    Whole Words: Common words or short phrases are typically one token. For example:
        "Hello" (1 token)
        "world" (1 token)

    Spaces and Special Characters: Spaces and special characters are also considered tokens. For example:
        "!" (1 token)
        " " (1 token) – a space character

Here are three specific examples:

    Simple Sentence:
        "ChatGPT is awesome!"
        Tokens: ["ChatGPT", " is", " awesome", "!"] (4 tokens)

    Code Snippet:
        print("Hello, world!")
        Tokens: ["print", "(", '"Hello', ',', ' world', '!"', ")"] (7 tokens)

    Email Address:
        "example@example.com"
        Tokens: ["example", "@", "example", ".", "com"] (5 tokens)

--Source Chatgpt 4o
