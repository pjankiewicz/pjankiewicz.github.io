---
title: "Zen Coding: Building Software That AI Can Understand and Evolve"
date: "2025-04-28"
description: "How to write software with AI"
publish: true 
---

<img src="/blog/static/images/zencoding.png" alt="ying and yang with data and functions">

## Table of Contents

- [Introduction](#introduction)
- [Data and Functions Are Enough](#data-and-functions-are-enough)
- [Frameworks](#frameworks)
- [Constraints and simplicity](#constraints-and-simplicity)
- [From Problem to Code: Practical Methodology](#from-problem-to-code-practical-methodology)
- [Data Structures and Functions — Simple Examples](#data-structures-and-functions--simple-examples)
- [Code as a Graph](#code-as-a-graph)
- [Why One Item per File](#why-one-item-per-file)
- [Evolution of Software in This Model](#evolution-of-software-in-this-model)
- [Programming Languages — Which Ones Are Best](#programming-languages--which-ones-are-best)
- [Summary](#summary)
- [Listings and Prompts](#listings-and-prompts)

## Introduction

Let's start with some strong assumptions:

- AI can and will write the majority of code in near future
- AI will handle arbitrarily complex problems and create better solutions than humans can — and much faster than humans can

That sounds grim but it is not the death of software engineers - just the opposite.
AI will write code but someone has to plan it, orchestrate it. Ideas more than anything will be what matters.

This AI evolution won't happen automatically. Code needs structure. AI more than anything needs very rigid structure to succeed. For example, I see a lot of posts negating the need for "types" or compiled languages — claiming it doesn't matter. It doesn't matter for us when writing human instructions to AI coding assistants. But it *does* matter for the AI, depending on the kind of structure it sees.

Right now AI sees and writes our code - the way humans write code - but this needs to change so that AI can evolve software faster. 

## Data and Functions Are Enough

That's all you need. The simpler, the better.

Zen coding is going back to the roots of programming — simplifying every task into two major components:

- Data (structures)
- Functions

When you began your coding career, what was the first thing you learned? It was writing simple functions and creating data structures — or even working with primitive ones.

It is proven that you can model even very complex systems purely with data structures and functions. Everything can be seen from a functional standpoint:

```rust
next_state = application(previous_state, action)
```

When you're moving a mouse cursor and clicking something on the screen, it’s an action.  The system adapts.  APIs are functions.

## Frameworks

Over the years, to simplify programming, we seemed to forget that fact.
We created frameworks that made it easier for us to reason about systems — hiding complexity behind bigger abstractions.

AI won't need such structures if all it sees are functions and data structures.

## Constraints and simplicity

Right now I see that the trend is to write AI code without any constraints.
That is nice for smaller projects. Serious projects need structure and constraints.
And while we don't like to be constrained, AI written code must be constrained.

The AI written code should have a very narrow path to succeed at any task and our role as software engineers is to constraint it as much as possible. The rules that I'm about to share would be hated by probably majority of software developers but the same rules will make the AI written code rock solid.

## From Problem to Code: Practical Methodology

Believe me or not but the workflow below can solve any problem. I tested it multiple times and it allowed me to create code faster than I ever imagined.

1. Start with the problem definition.
2. Expand it with AI — think about details, user scenarios, what happens for users, what needs to happen inside the system.
3. Ask AI to create data structures that solve the problem.
4. Ask AI for function signatures that solve the problem.
5. Ask AI to organize the functions into modules.
6. Ask AI to implement the functions (this can be parallelized).
7. Fix errors.

Of course it is best if you review data structures and functions definitions. The prompt that create functions declarations should mention it very explicitly that if there is a risk that a function will exceed 50 lines of code it must use other functions. This is a bit of a chicken and egg problem but in my opinion it is solveable.

The instructions must mention that each function or data structure needs to be in a separate file.

## Data Structures and Functions — Simple Examples

Example of a data structure (single file):

```rust
//! Represents a rectangle defined by its width and height.
//!
//! The rectangle is axis-aligned and does not carry position information.
//! Used for basic geometric calculations.

#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
pub struct Rectangle {
    /// The width of the rectangle.
    pub width: f64,
    /// The height of the rectangle.
    pub height: f64,
}
```

Example of a function (single file):

```rust
//! Calculates the area of a rectangle.
//!
//! Multiplies the rectangle's width by its height to compute the area.

pub fn calculate_area(rectangle: &crate::rectangle::Rectangle) -> f64 {
    rectangle.width * rectangle.height
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_calculate_area() {
        let rectangle = crate::rectangle::Rectangle {
            width: 3.0,
            height: 4.0,
        };
        let area = super::calculate_area(&rectangle);
        assert_eq!(area, 12.0);
    }

    #[test]
    fn test_calculate_area_zero() {
        let rectangle = crate::rectangle::Rectangle {
            width: 0.0,
            height: 5.0,
        };
        let area = super::calculate_area(&rectangle);
        assert_eq!(area, 0.0);
    }

    #[test]
    fn test_calculate_area_negative_dimensions() {
        let rectangle = crate::rectangle::Rectangle {
            width: -2.0,
            height: 3.0,
        };
        let area = super::calculate_area(&rectangle);
        assert_eq!(area, -6.0);
    }
}
```

## Code as a Graph

A single file per data structure or function might feel a bit strange. So why do it?

The code that has nothing but data structures and functions becomes a **graph**. Functions and data structures are **nodes** in the graph. Connections (function calls, struct usage) are the edges.

The code is no longer a linear text file — it becomes a **living graph**. Soon, all software will be written like this — living in databases, managed and improved continuously by AI. Files are just a human-readable slice of the real structure.

The advantages are clear:

- Dependency graphs become obvious and easy to analyze.
- Parallel editing by humans and AI becomes trivial.
- Merge conflicts become rare and localized.
- Changes are surgical: updating one function doesn’t risk unrelated parts.

## Evolution of Software in This Model

In this model, software stops being text files and becomes a **dynamic graph** of small, meaningful pieces.

Over time:

- AI will analyze, optimize, and repair parts of the graph.
- Functions and structs will evolve.
- Unused nodes will be pruned.
- Codebases will no longer "rot" — they will live, adapt, and improve.

Files will eventually become just an optional access layer for humans. The real software will live in structured graph databases.

## Programming Languages — Which Ones Are Best

The stricter the language, the better for AI coding. Structure is not for humans — it's to minimize the possibility of errors.

<div style="text-align: center; font-family: sans-serif; font-size: 18px; margin-top: 40px; margin-bottom: 40px">
    <strong>Programming Languages by Strictness</strong><br><br>
    Python → JavaScript → Ruby → PHP → Go → C# → Java → Kotlin → C++ → Rust → Haskell
</div>

Personally, I think Rust is currently the best language for AI coding. It enforces explicitness and structure, while remaining powerful enough for high-level abstractions.
And, yes that makes Python the worst language for AI to write code.

## Summary

That's it. You need only data structures and functions. No fancy frameworks. No spaghetti code. Every problem is solveable using this methodology and it will guarantee that your code is maintainable and AI will have no problems to evolve it.

Happy Zen Coding!

## Listings and Prompts

Example coding guidelines for Rust

```markdown
## Rust Coding Standards: One Item Per File

These standards promote extreme modularity and clarity of origin by enforcing a strict "one item per file" structure and mandating the use of fully qualified paths.

**1. Granularity: One Logical Item Per File**

*   **Rule:** Each `.rs` file must contain exactly one primary logical Rust item.
*   **Definition of "Item":** This typically refers to a single `fn`, `struct`, `enum`, `type` alias, or constant (`const`/`static`). Traits and generic items are generally discouraged unless strictly required for interaction with external library APIs.
    *   Associated `impl` blocks for a `struct` or `enum` defined in `my_item.rs` should also reside within `my_item.rs`.
    *   `impl Trait for Type` blocks might reside with `Type`'s definition if `Type` is local, or potentially in their own file (e.g., `my_type_impl_some_trait.rs`) if the implementation itself is complex or significant, especially when implementing external traits for local types or vice-versa. For simplicity, start by keeping implementations with the type definition.
*   **File Naming:** Files should be named using `snake_case.rs`, matching the name of the item they contain (e.g., `my_function.rs` for `fn my_function`, `my_struct.rs` for `struct MyStruct`).
*   **Modules:** Module files (`mod.rs` or `directory/mod.rs`) are exceptions as their purpose is to declare and organize sub-modules or re-export items. However, they should generally not contain item definitions themselves, only `mod` statements.

**2. File Preamble Documentation**

*   **Rule:** Every `.rs` file *must* begin with file-level documentation comments (`//!`).
*   **Structure:**
    *   The very first line must be a single, concise sentence summarizing the purpose or content of the file (the item it defines).
    *   Follow this immediately with a blank documentation line (`//!`).
    *   Provide 3-5 additional lines (`//!`) expanding on the summary, detailing purpose, context, high-level usage, or important considerations.

**3. No Imports: Use Fully Qualified Paths**

*   **Rule:** `use` statements are forbidden, with no exceptions.
*   **Usage:** All types, functions, macros, traits, etc., from the standard library, external crates, or other modules within the current crate must be referred to by their fully qualified path.
    *   Example (Standard Library): `std::collections::HashMap`, `std::vec::Vec`, `std::string::String`, `std::println!`
    *   But things that are available without imports are ok without FQN: `Vec`, `String`, `println!`, `Option` etc
    *   Example (External Crate `serde`): `serde::Serialize`, `serde_json::to_string`
    *   Example (Internal Crate): `crate::Mymod::MyStruct`, `crate::utils::helper_function`
*   **Rationale:** This makes the origin of every identifier immediately explicit, reducing ambiguity, although it increases verbosity.

**Functional Style Encouraged**

*   **Guideline:** While adhering to the rules above, favor a functional programming style where appropriate.
*   **Rationale:** Aligns with the broader framework's emphasis on pure functions and data transformations (as outlined in the main `CODING_STANDARDS.md`). Prefer immutable data, pure functions, and iterator-based transformations (`map`, `filter`, `fold`, `sum`, etc.) over imperative loops and mutable state when it enhances clarity and maintains conciseness.
*   **Example:** The example function `calculate_weighted_sum` demonstrates using iterators (`zip`, `map`, `sum`) for calculation.

---

**4. Function Length Limit**

*   **Rule:** Functions should not exceed 50 lines of code (LoC).
*   **Measurement:** This count includes lines within the function body `{ ... }`, excluding the function signature, comments, and blank lines.
*   **Goal:** Encourage breaking down complex logic into smaller, more focused, testable, and reusable functions. Promotes the Single Responsibility Principle at the function level.
*   **Exceptions:** Permitted rarely and must be justified. Examples include:
    *   Large but simple `match` statements that are inherently sequential and difficult to split meaningfully.
    *   Boilerplate code generated by macros (though the generated code might exceed the limit, the source code shouldn't).
    *   Functions primarily consisting of data structure literals.
    *   *When making an exception, add a comment explaining why the function length is justified.*

**5. In-File Tests for Functions**

*   **Rule:** Unit tests for a function must reside within the same file as the function definition.
*   **Structure:** Use the standard `#[cfg(test)]` attribute on a private inner module (conventionally named `tests`).
    *   ```rust
    // ... function definition ...

    #[cfg(test)]
    mod tests {
    // Use super::* to access the item in the parent module (the file scope)
    // Note: Even with super::*, accessing OTHER items still requires full paths.
    // For the function under test:
    // use super::my_function_name; // This would be disallowed by Rule 3 if strictly applied
    // Instead, call it via super::my_function_name directly.

          #[test]
          fn test_case_1() {
              let result = super::my_function_name( /* args */ );
              std::assert_eq!(result, expected_value); 
              // Note: assert_eq! is often in the prelude, but strictly might require std::assert_eq!
          }
          // ... more tests ...
    }
      ```
*   **Scope:** Tests should focus on validating the behavior of the function defined in the file, covering success cases, edge cases, and error conditions.


## Example Ideal File: `calculate_weighted_sum.rs`

//! Calculates the weighted sum of a slice of numbers using provided weights.
//!
//! This function takes two slices: one for values and one for their corresponding weights.
//! It computes the sum of `value * weight` for each pair.
//! Returns an error if slices differ in length or are empty.
//! Ensures inputs are valid before calculation.

//! Revision History
//! - 2025-04-13T13:37:01Z @AI: Refined internal comments per latest request.
//! - 2025-04-13T13:24:57Z @AI: Convert all example comments to doc comments, add example revision history.

pub fn calculate_weighted_sum(values: &[f64], weights: &[f64]) -> Result<f64, String> {
    // Validate input lengths.
    if values.len() != weights.len() {
        return std::result::Result::Err(std::string::String::from(
            "Value and weight slices must have the same length.",
        ));
    }
    // Handle empty slices case. Weighted sum of empty is 0.0.
    if values.is_empty() {
          return Result::Ok(0.0);
    }

    // Calculate using functional style: zip values and weights, map to product, sum results.
    let weighted_sum: f64 = values
        .iter()
        .zip(weights.iter())
        .map(|(v, w)| v * w)
        .sum();

    Result::Ok(weighted_sum)
}

#[cfg(test)]
mod tests {
    // Access the function under test via `super::`. Full paths for other items.
    // Test documentation is concise per guidelines.
    #[test]
    fn test_basic_weighted_sum() {
        // Test with standard positive values.
        let values = [1.0, 2.0, 3.0];
        let weights = [0.5, 1.0, 2.0];
        // Expected: (1.0*0.5) + (2.0*1.0) + (3.0*2.0) = 0.5 + 2.0 + 6.0 = 8.5
        let result = super::calculate_weighted_sum(&values, &weights);
        // Note: Using std::assert_eq! directly for simplicity. Float comparison might need tolerance.
        assert_eq!(result, Result::Ok(8.5));
    }

    #[test]
    fn test_empty_slices() {
        // Test the defined behavior for empty input slices.
        let values: [f64; 0] = [];
        let weights: [f64; 0] = [];
        let result = super::calculate_weighted_sum(&values, &weights);
        // Expected: Ok(0.0) based on implementation choice.
        assert_eq!(result, Result::Ok(0.0));
    }

    #[test]
    fn test_mismatched_lengths() {
        // Test error handling for slices of different lengths.
        let values = [1.0, 2.0];
        let weights = [0.5];
        let result = super::calculate_weighted_sum(&values, &weights);
        assert!(result.is_err());
        // Check the specific error message.
        assert_eq!(
            result.unwrap_err(),
            String::from("Value and weight slices must have the same length.")
        );
    }

    #[test]
    fn test_negative_values_and_weights() {
        // Test calculation with negative numbers.
        let values = [-1.0, 2.0];
        let weights = [3.0, -0.5];
        // Expected: (-1.0 * 3.0) + (2.0 * -0.5) = -3.0 + -1.0 = -4.0
        let result = super::calculate_weighted_sum(&values, &weights);
        assert_eq!(result, Result::Ok(-4.0));
    }
}

This example adheres to all the specified rules:
1.  **One Item:** The file `calculate_weighted_sum.rs` contains only the function `calculate_weighted_sum`.
2.  **Preamble:** It starts with `//!` documentation, including a one-sentence summary and further lines of explanation.
4.  **Function Length:** The function body is short, well under 50 lines.
5.  **In-File Tests:** Tests are included in the same file under `#[cfg(test)] mod tests { ... }`, using `super::calculate_weighted_sum` to access the function.

IMPORTANT:
- **Application, Not Inclusion:** These guidelines describe *how* to write code. Do not copy the text of these guidelines into your Rust source files. Apply the principles described here.
- struct fields can be public
```

## Prompts

### 2. Expand the Brief

**Prompt:**

```md
Based on this short problem description:  
`[INSERT_SHORT_PROBLEM_DESCRIPTION]`

Expand it by listing:
- User actions and user scenarios
- Internal system behavior required for those actions
- Error situations
- Preconditions that must be validated

Be concise but cover all necessary operations clearly. No code yet.  
Focus on capturing everything that happens externally (user view) and internally (system view).
```

---

## 3. Ask for Data Structures

**Prompt:**

```md
Based on this expanded brief:  
`[INSERT_EXPANDED_BRIEF]`

Define minimal necessary data structures to represent the problem clearly.

Rules:
- Prioritize simple, immutable structs or enums.
- Prefer primitive types where possible (`String`, `u32`, `bool`, etc.).
- If something is optional, use an `Option<T>`.
- If it’s a list, use a `Vec<T>`.
- Flatten nested data unless strong logical grouping exists.

Output only the data structure definitions, no additional explanation.  
Use Rust.
```

---

## 4. Ask for Function Signatures

**Prompt:**

```md
Based on these data structures:  
`[INSERT_DATA_STRUCTURES]`

Define only the function signatures needed to solve the problem.

Rules:
- Focus each function on a single responsibility.
- Prefer pure functions — input parameters and return values must be clearly defined.
- Avoid hidden side effects.
- Use `Result<T, E>` for any operation that might fail.
- If a function may grow larger than 50 lines, it must be split into helper functions.

Output only the function signatures (names, parameters, return types), no implementation yet.  
Use Rust.
```

---

## 5. Ask for Module Organization

**Prompt:**

```md
Based on these functions:  
`[INSERT_FUNCTION_SIGNATURES]`

Organize them into logical Rust modules.

Rules:
- Each file must contain exactly one function or one data structure.
- Create minimal module trees — don't overnest.
- Group logically related functions into the same directory but still in separate files.
- Suggest file and module names using `snake_case`.

Output a list like:
src/
module_a/
function_x.rs
function_y.rs
module_b/
struct_z.rs
```

No code yet — just structure.

---

## 6. Ask for Function Implementations

**Prompt:**

```md
Based on this function signature:  
`[INSERT_FUNCTION_SIGNATURE]`

Write the full Rust implementation of this function.

Rules:
- Assume you know everything you need from the input parameters and expected output.
- Do not assume any hidden context, no external dependencies except the input arguments.
- Keep the function under 50 lines if possible (excluding comments).
- If it might exceed 50 lines, break into helper functions and implement them as well.
- Use only public standard library (`std`) types and functions unless otherwise specified.
- Handle errors using `Result<T, E>` when needed.

Add minimal doc-comments (`///`) for the function itself and any helper functions.
```