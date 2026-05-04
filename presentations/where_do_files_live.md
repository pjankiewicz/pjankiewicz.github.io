Where do files live in AI generated programs.

Intro
=====

Who am I? Pawel Jankiewicz. ML - first kaggle grandmaster in Poland.
I write Rust almost exclusively for about 7 years now.
I was kind of familiar with some programming paradigms like functional programming.
Went through some stages of learning Scala.
Rust for me is a very good balance of what functional programming brings to the table with the flexibility of procedural code.

About the presentation
=====

First of all this presentation does not answer a lot of questions.
As the matter of fact you will probably have more questions than answers at the end of it.
But that's a good thing. I hope you will just start thinking about those problems a bit more.

AI coding
=========

When the AI became so powerful that it was quite evident that it will be a very good assistant
to software engineering I wrote a lot of tools that automate some aspects of programming as early 
as 3 years ago.

https://github.com/pjankiewicz/mechatyper

AI coding and structure
======

Then I tried to automate the work even more by streamlining it and splitting into smallest possible
atoms. And you can agree or not but one of the most important concepts in programming is that of a function - not a class, module etc. Just a function. So I then started experimenting with writing software building up functions and data structures.

The methodology was quite simple:
- design data types first (very small footprint a lot of dependencies)
- design functions (signatures)
- implement functions
- profit

AI code and constraints
==========

AI code need harnesses and a lot of them

Why rust
======

Rust is quite rigid and verbose
Powerful data type system
Very useful compiler

Rust + LLM = good code

But...
=======

But if we have functions and data structures and basically they form a graph why do we need files.
I mean files are ok but the way AI coding assistants are using them is wrong. Most popular coding
assistants don't use files the way they should be used which is using AST to split up the files make changes and convert it back to files, they are using line search make complex edits.

So the first transition phase for me is to split files into smallest possible atoms 

- show rust coding guidelines

Basically I write production projects as if the files were nodes in the graph: functions and data structures are separate, trying to avoid synctatic sugar like proc macros and sometimes even traits.

In the meantime the AI coding assistant are becoming better and better so when I'm lazy I don't include those guidelines. And I often regret that because AI without constraints creates files which it does not want to use as context and there is nothing better for AI than just reading a file name and more or less know what's inside.

Lambdagraph
===========

I had a concept of a self contained environment to host applications that would be composed of nothing
but a:
- data structures
- functions
- capabilities

The capabilities part is very inspired by crux project it basically decomposes the things that are dependent on the platform itself or provide side effects.

What are the capabilities:
- network requests
- database requests (although it could be considered also a network)
- blob storage
- logging
- canvas

Mic drop moment
=======

We are actually in lambdagraph presentation app that claude built for this talk.
Then I present lambda graph UI.

Future
======

I wouldn't call myself a very good software engineer but I think one of the engineering rules
is also to think of something and then work backwards to achieve it.

So what the future looks like of systems which have virtualized functions, data structures etc.
I'm thinking about a system which is fully managed by AI.
The system will have a tendency to assimilate new functionalities rather than use external ones - it is happening now - why include a library to use a single function where you can just rewrite it without a lot of dependencies.

Self healing system - an swarm of AI agents constantly improving every aspect of the system - speed, security functionalities

No versions, releases just continuous development and immediate releases of the code.

If we can let loose the imagination a bit.

Other projects
==============

smalltalk
spacetimedb.com
volt???