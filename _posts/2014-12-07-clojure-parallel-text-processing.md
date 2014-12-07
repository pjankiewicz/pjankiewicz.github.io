---
layout: post
title: "Clojure parallel text processing"
description: ""
category: 
tags: []
---
{% include JB/setup %}

I've been recently looking at Clojure programming language. I was thinking that my text processing tasks could benefit from the expressiveness of this language.
One of the most frequent things that I do with text is clean it and normalize it. In this case I use this pipeline:

1. convert to uppercase
2. replace all non alphanumerics with " "
3. repace all multiple spaces with single space
4. join words with hanging hyphens "a - b" -> "a-b"

Here is a Clojure code to load some big text file (1 sentence per line) and perform these operations:

<pre>
(require '[clojure.string :as str])

(defn clean-title
  [title]
  (-> title
      str/upper-case
      (str/replace #"[^A-Z0-9 -]" " ")
      (str/replace #"\s+" " ")
      (str/replace #"\s?\-\s?" "-")
      str/trim))

(def titles (str/split (slurp "somebigfile") #"\n"))
</pre>

One of the things that Clojure is so proud is support parallelism. 
First let's use a simple map function to conver all sentences

<pre>> (time (doall (map clean-title titles)) (println "finished!"))
finished!
"Elapsed time: 9917.938119 msecs"
</pre>

10 seconds to process 1 million sentences. This is not bad. We should 
be able to use parallel implementation of ```map``` function ```pmap```.

<pre>> (time (doall (pmap clean-title titles)) (println "finished!"))
finished!
"Elapsed time: 8944.514524 msecs"
</pre>

What?!?! Only 10% faster. I have 4 cores so I should expect ~4x improvement.
After researching this I have found out that the ```pmap``` function is supposed
to handle longer tasks. When there is 1 million elements collection there
is too much overhead when creating the threads.

The solution is to use ```partition-all``` function which splits the sequence into 
smaller chunks:

<pre> > (partition-all 3 (range 10))
((0 1 2) (3 4 5) (6 7 8) (9))
</pre>

Please be careful not to use the ```partition``` function because it does not include
chunks smaller than n. For example

<pre> > (partition 3 (range 10))
((0 1 2) (3 4 5) (6 7 8))
</pre>

We are now ready to split our job 50000 elements chunks (~20 chunks total).
Another important thing is to call ```doall``` on ```map``` and ```pmap``` result
because both these functions are lazy and you need to make sure that 
they are realized inside the call.

<pre>> (time (doall (pmap #(doall (map clean-title %)) 
                          (partition-all 50000 titles))) 
             (println "finished!"))
finished!
"Elapsed time: 3022.481366 msecs
</pre>

That's more like it 3.4x speed-up.

To conclude - I'm fairly satisfied with how Clojure handles parallelism.