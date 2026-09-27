// Local Intelligent Solver & Knowledge Base for Coding, Math, and Study Questions
// Provides rich, structured answers even before an external API key is added.

export function generateLocalAgentResponse(prompt, persona = 'general') {
  const p = prompt.toLowerCase().trim();

  // 1. Math / Arithmetic Direct Evaluation
  const mathMatch = prompt.match(/(?:calculate|solve|evaluate|compute|\bwhat is\b|\bkitna hota hai\b)?\s*([0-9\.\s\+\-\*\/\^\(\)\%]{3,})/i);
  if (mathMatch && mathMatch[1] && /[\+\-\*\/]/.test(mathMatch[1])) {
    try {
      const sanitized = mathMatch[1].replace(/\^/g, '**');
      if (/^[0-9\.\s\+\-\*\/\(\)\%]+$/.test(sanitized)) {
        // Safe evaluation
        const result = Function(`"use strict"; return (${sanitized});`)();
        return {
          thought: "Recognized arithmetic calculation request. Parsing expression and computing exact numerical result.",
          content: `### 📐 Calculation Result\n\nExpression: **\`${mathMatch[1].trim()}\`**\n\n$$${mathMatch[1].trim()} = ${result}$$\n\n**Result:** \`${result}\``
        };
      }
    } catch {
      // Continue to pattern match
    }
  }

  // 2. Quadratic Equation
  if (p.includes('quadratic') || p.includes('dwighat') || (p.includes('ax^2') || p.includes('x^2'))) {
    return {
      thought: "User requested explanation or solution for quadratic equations. Formulating general standard form, discriminant formula, and step-by-step derivation.",
      content: `### 📐 Quadratic Equation (द्विघात समीकरण)

A quadratic equation is a second-order polynomial equation in a single variable $x$:

$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$

#### 1. The Quadratic Formula:
To find the roots $x_1$ and $x_2$:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

#### 2. The Discriminant ($D$):
The term inside the square root determines the nature of the roots:

$$D = b^2 - 4ac$$

- If **$D > 0$**: Two distinct real roots ($x_1 \\neq x_2$)
- If **$D = 0$**: Exactly one real root (repeated root: $x = -\\frac{b}{2a}$)
- If **$D < 0$**: Two complex conjugate roots ($x = \\frac{-b \\pm i\\sqrt{|D|}}{2a}$)

#### 3. Example: Solve $x^2 - 5x + 6 = 0$
- Here: $a = 1, b = -5, c = 6$
- Discriminant: $D = (-5)^2 - 4(1)(6) = 25 - 24 = 1$
- Roots:
  $$x = \\frac{-(-5) \\pm \\sqrt{1}}{2(1)} = \\frac{5 \\pm 1}{2}$$
  $$x_1 = \\frac{6}{2} = 3, \\quad x_2 = \\frac{4}{2} = 2$$

✅ **Roots are $x = 2$ and $x = 3$.**`
    };
  }

  // 3. Binary Search
  if (p.includes('binary search') || (p.includes('search') && p.includes('sorted'))) {
    return {
      thought: "User asked for Binary Search algorithm. Constructing Python, C++, and JavaScript implementations with Time & Space complexity analysis.",
      content: `### 💻 Binary Search Algorithm

**Binary Search** is an efficient $O(\\log n)$ algorithm for finding an element in a **sorted array**. It repeatedly divides the search interval in half.

#### ⏱️ Complexity:
- **Time Complexity**: Best Case $O(1)$, Worst & Average Case $O(\\log n)$
- **Space Complexity**: $O(1)$ Iterative, $O(\\log n)$ Recursive

#### Python Implementation:
\`\`\`python
def binary_search(arr, target):
    \"\"\"Returns the index of target in sorted arr, or -1 if not found.\"\"\"
    left = 0
    right = len(arr) - 1

    while left <= right:
        # Calculate mid to prevent integer overflow
        mid = left + (right - left) // 2

        if arr[mid] == target:
            return mid  # Target found at index mid
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1 # Search left half

    return -1  # Target not found

# Example Usage:
numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23
result = binary_search(numbers, target)
print(f"Target {target} found at index: {result}")
\`\`\`

#### How It Works Step-by-Step:
1. Start with \`left = 0\` and \`right = n - 1\`.
2. Find middle index $mid = \\lfloor\\frac{left + right}{2}\\rfloor$.
3. If \`arr[mid] == target\`, return index.
4. If \`arr[mid] < target\`, element must be on right half $\rightarrow$ set \`left = mid + 1\`.
5. If \`arr[mid] > target\`, element must be on left half $\rightarrow$ set \`right = mid - 1\`.`
    };
  }

  // 4. Two Sum Problem
  if (p.includes('two sum') || (p.includes('sum') && p.includes('target') && p.includes('array'))) {
    return {
      thought: "User requested Two Sum solution. Demonstrating both Brute Force O(n^2) and Optimal Hash Map O(n) approach.",
      content: `### 💻 Two Sum Problem (LeetCode #1)

**Problem:** Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

#### Optimal Hash Map Approach ($O(n)$):
We keep track of numbers we have already seen in a hash map. For each number $x$, we check if $(target - x)$ already exists in our map.

\`\`\`python
def two_sum(nums, target):
    seen = {}  # maps value -> index
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
        
    return []

# Test:
nums = [2, 7, 11, 15]
target = 9
print("Indices:", two_sum(nums, target))  # Output: [0, 1]
\`\`\`

#### 📊 Complexity:
- **Time Complexity:** $O(n)$ (single pass through array)
- **Space Complexity:** $O(n)$ (stores up to $n$ elements in hash map)`
    };
  }

  // 5. Photosynthesis / Science Study Query
  if (p.includes('photosynthesis') || p.includes('prakash sanshleshan')) {
    return {
      thought: "User asked for explanation of Photosynthesis. Formulating biological chemical equation, stages (light and dark reactions), and significance.",
      content: `### 🌿 Photosynthesis (प्रकाश संश्लेषण)

**Photosynthesis** is the biological process by which green plants, algae, and certain bacteria convert light energy into chemical energy stored in glucose.

#### 🧪 Overall Chemical Equation:
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Photons} \\xrightarrow{\\text{Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

#### Key Stages:
1. **Light-Dependent Reactions (Thylakoid Membrane):**
   - Chlorophyll absorbs sunlight.
   - Water molecules ($\\text{H}_2\\text{O}$) split into Oxygen ($\\text{O}_2$), protons ($\\text{H}^+$), and electrons (Photolysis).
   - Generates energy carriers: **ATP** and **NADPH**.

2. **Calvin Cycle / Dark Reactions (Stroma):**
   - Carbon fixation: enzyme **RuBisCO** fixes atmospheric $\\text{CO}_2$.
   - Uses ATP and NADPH to synthesize high-energy sugars (Glucose $\\text{C}_6\\text{H}_{12}\\text{O}_6$).

#### 💡 Key Takeaway:
Photosynthesis produces oxygen for living organisms and forms the base of almost all ecological food chains on Earth.`
    };
  }

  // 6. Reverse a String or Array
  if (p.includes('reverse') && (p.includes('string') || p.includes('array') || p.includes('list'))) {
    return {
      thought: "User asked how to reverse a string or array. Providing solutions in Python, JavaScript, and C++ with two-pointer explanation.",
      content: `### 💻 Reversing a String / Array

Here are the most idiomatic and efficient ways to reverse data structures across major languages:

#### 1. Python:
\`\`\`python
# Method 1: Slicing (Fastest, O(n) time, O(n) space)
s = "Antigravity"
reversed_s = s[::-1]
print(reversed_s)

# Method 2: In-place Array Reverse (Two-Pointer, O(1) extra space)
def reverse_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr

print(reverse_array([1, 2, 3, 4, 5]))  # [5, 4, 3, 2, 1]
\`\`\`

#### 2. JavaScript:
\`\`\`javascript
// Reverse a string
const str = "Hello World";
const reversedStr = str.split("").reverse().join("");
console.log(reversedStr);

// Reverse array in-place
const nums = [10, 20, 30, 40];
nums.reverse();
console.log(nums);
\`\`\`

#### 3. C++ (STL & In-place):
\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {1, 2, 3, 4, 5};
    std::reverse(v.begin(), v.end());
    for(int x : v) std::cout << x << " ";
    return 0;
}
\`\`\``
    };
  }

  // 7. React Hooks (useState, useEffect)
  if (p.includes('react') || p.includes('usestate') || p.includes('useeffect') || p.includes('hooks')) {
    return {
      thought: "User requested explanation of React Hooks. Explaining useState and useEffect with clean modern React component example.",
      content: `### ⚛️ React Hooks: \`useState\` & \`useEffect\`

Hooks let you use state and lifecycle features inside functional components without writing class components.

#### 1. \`useState\` (Managing State):
\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 rounded-lg bg-gray-50 border">
      <p className="text-lg font-semibold">Count: {count}</p>
      <div className="mt-2 flex gap-2">
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(0)}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
\`\`\`

#### 2. \`useEffect\` (Side Effects & Lifecycle):
\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 1. Mount: start interval
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // 2. Unmount cleanup: avoid memory leaks
    return () => clearInterval(interval);
  }, []); // Empty dependency array = runs only on mount

  return <p>Elapsed: {seconds}s</p>;
}
\`\`\`

#### 📌 Key Rules of Hooks:
1. Only call hooks at the **top level** of your component (do not call inside loops or conditions).
2. Only call hooks from **React functions** or custom hooks.`
    };
  }

  // 8. Newton's Laws of Motion / Physics Study
  if (p.includes('newton') || p.includes('laws of motion') || p.includes('gati ke niyam')) {
    return {
      thought: "User asked for Newton's Laws of Motion. Formulating all three laws with equations, real-life examples, and mathematical representations.",
      content: `### ⚡ Newton's Three Laws of Motion

Sir Isaac Newton formulated the three fundamental laws describing the relationship between a body and the forces acting upon it:

---

#### 1️⃣ First Law: Law of Inertia (जड़त्व का नियम)
> *"An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced external force."*

- **Mathematical Condition:**
  $$\\sum \\vec{F} = 0 \\implies \\vec{a} = 0 \\implies \\vec{v} = \\text{constant}$$

---

#### 2️⃣ Second Law: Fundamental Law of Dynamics
> *"The rate of change of momentum of an object is directly proportional to the applied resultant force and occurs in the direction of the force."*

$$\\vec{F} = \\frac{d\\vec{p}}{dt} = m \\vec{a}$$

Where:
- $\\vec{F}$ is force in Newtons ($\\text{N} = \\text{kg}\cdot\\text{m/s}^2$)
- $m$ is mass ($\\text{kg}$)
- $\\vec{a}$ is acceleration ($\\text{m/s}^2$)

---

#### 3️⃣ Third Law: Action and Reaction (क्रिया-प्रतिक्रिया का नियम)
> *"For every action, there is an equal and opposite reaction."*

$$\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}$$

- **Real-world Example:** When a rocket expels exhaust gases downward with great force, the expelled gas pushes the rocket upward with equal force.`
    };
  }

  // 9. Python Basics / Learning Python
  if (p.includes('python') && (p.includes('sikho') || p.includes('learn') || p.includes('basics') || p.includes('start'))) {
    return {
      thought: "User wants to learn Python basics. Providing a structured overview with essential syntax, variables, conditionals, loops, and functions.",
      content: `### 🐍 Python Quickstart Guide for Beginners

Python is an elegant, easy-to-read programming language widely used in AI, Data Science, Web Development, and Automation.

#### 1. Variables & Data Types:
\`\`\`python
# Numbers, Strings, and Booleans
name = "Ayaz"
age = 22
gpa = 3.85
is_student = True

# Lists (Arrays) & Dictionaries (Key-Value)
skills = ["Python", "JavaScript", "C++"]
profile = {
    "role": "Software Developer",
    "experience_years": 2
}

print(f"Hello, my name is {name} and I code in {skills[0]}!")
\`\`\`

#### 2. Conditional Statements & Loops:
\`\`\`python
score = 85

if score >= 90:
    grade = "A+"
elif score >= 75:
    grade = "A"
else:
    grade = "B"

# For loop with range
for i in range(1, 6):
    print(f"Step {i}: Square is {i**2}")
\`\`\`

#### 3. Functions:
\`\`\`python
def solve_problem(problem_name, difficulty="Medium"):
    return f"Problem '{problem_name}' solved successfully at {difficulty} level! 🚀"

print(solve_problem("Two Sum", "Easy"))
\`\`\`

Ask me any specific topic (Loops, OOP, List Comprehension, APIs, DSA) and we will dive into it!`
    };
  }

  // 10. General / Fallback Intelligent Answer
  let personaIntro = "I am your AI Agent assistant.";
  if (persona === 'coding') personaIntro = "I am your dedicated Coding & Software Engineering Mentor.";
  if (persona === 'math') personaIntro = "I am your Mathematics & Scientific Problem Solver.";
  if (persona === 'study') personaIntro = "I am your Socratic Study Partner & Exam Tutor.";

  return {
    thought: `User queried: "${prompt.slice(0, 60)}...". Applying ${persona} analytical framework to give a clear, structured response.`,
    content: `### 💡 ${personaIntro}

I received your prompt: **"${prompt}"**

Here is a structured breakdown to help you solve this:

#### 1. Key Concepts:
- Identify the core objective: determine what inputs you have and what output or understanding is required.
- Break down the challenge into smaller, manageable sub-problems.

#### 2. Recommended Next Step:
- You can ask me to:
  - **Write & explain code** in any language (Python, JavaScript, C++, Java, etc.).
  - **Solve mathematical equations** step-by-step with LaTeX formulas.
  - **Prepare study summaries** or quiz questions for exams.
  - **Run code preview** using the code runner tool.

> 🔑 **Tip:** To unlock live unrestricted cloud intelligence with Gemini 2.0 Flash or OpenAI models, simply click the **Settings** icon (⚙️) in the top-right corner and paste your free Google Gemini API key!`
  };
}
