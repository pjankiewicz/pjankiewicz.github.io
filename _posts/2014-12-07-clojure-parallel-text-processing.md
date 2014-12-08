---
layout: post
text: "Clojure parallel text processing"
description: ""
category: 
tags: [clojure text-processing parallel]
---
{% include JB/setup %}

I've been recently looking at Clojure programming language. I was thinking that my text processing tasks could benefit from the expressiveness of this language.
One of the most frequent things that I do with text is clean it and normalize it. In this case I use this pipeline:

1. convert to uppercase
2. replace all non alphanumerics with " "
3. repace all multiple spaces with single space
4. join words with hanging hyphens "a - b" -> "a-b"
5. trim spaces

Here is a Clojure code to load some big text file (1 sentence per line) and perform these operations:

{% highlight clojure %}
(require '[clojure.string :as str])

(defn clean-text
  [text]
  (-> text
      str/upper-case
      (str/replace #"[^A-Z0-9 -]" " ")
      (str/replace #"\s+" " ")
      (str/replace #"\s?\-\s?" "-")
      str/trim))

(def texts (str/split (slurp "somebigfile") #"\n"))
{% endhighlight %}

One of the things that Clojure is so proud is parallelism support. 
First let's use a simple map function to conver all sentences

{% highlight clojure %}
> (time (doall (map clean-text texts)) (println "finished!"))
finished!
"Elapsed time: 9917.938119 msecs"
{% endhighlight %}

10 seconds to process 1 million sentences. This is not bad. We should 
be able to use parallel implementation of ```map``` function ```pmap```.

{% highlight clojure %}
> (time (doall (pmap clean-text texts)) (println "finished!"))
finished!
"Elapsed time: 8944.514524 msecs"
{% endhighlight %}

What?!?! Only 10% faster. I have 4 cores so I should expect ~4x improvement.
After researching this I have found out that the ```pmap``` function is supposed
to handle longer tasks. When there is 1 million element collection there
is too much overhead when creating the threads.

The solution is to use ```partition-all``` function which splits the sequence into 
smaller chunks and then use ```pmap``` on the chunks. Here is how ```partition-all```
works:

{% highlight clojure %}
> (partition-all 3 (range 10))
((0 1 2) (3 4 5) (6 7 8) (9))
{% endhighlight %}

Please be careful not to use the ```partition``` function because it does not include
chunks smaller than n. For example

{% highlight clojure %}
> (partition 3 (range 10))
((0 1 2) (3 4 5) (6 7 8))
{% endhighlight %}

We are now ready to split our job 50000 elements chunks (~20 chunks total).
Another important thing is to call ```doall``` on ```map``` and ```pmap``` result
because both these functions are lazy and you need to make sure that 
they are realized inside the call.

{% highlight clojure %}
> (time (doall (pmap #(doall (map clean-text %)) 
                      (partition-all 50000 texts))) 
               (println "finished!"))
finished!
"Elapsed time: 3022.481366 msecs"
{% endhighlight %}

That's more like it 3.4x speed-up.
