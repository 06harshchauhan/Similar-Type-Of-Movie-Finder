# Content-Based Movie Recommendation System
A movie and web series recommendation engine developed in JavaScript, HTML, and CSS. 

The application utilizes categorical multi-label genre vectors and computes pairwise similarity scores using the Cosine Similarity metric to deliver ranked suggestions in real time.

## Overview

Unlike collaborative filtering systems that depend on user history and ratings matrix factorization, this implementation follows a **Content-Based Filtering** approach. Each title is modeled solely on its intrinsic metadata (genres).

The goal of this project was to implement vector space retrieval and similarity ranking from scratch without relying on external machine learning frameworks 


## Project Structure

```text
similar-type-of-movie-finder/
│
├── index.html        
├── css/
│   └── style.css     
├── js/
│   ├── dataset.js   
│   └── app.js        
└── README.md         
