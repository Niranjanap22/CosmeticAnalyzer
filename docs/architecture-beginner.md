### CosmoBot Architecture (Beginner-Friendly)

This document explains how the app is structured, what the `@` alias is, what `lucide-react` is, why Firebase lives in `lib`, and how data flows through the code when a user scans a product.

---

### 1. User Story (What the app does)

Imagine Sarah:

- **Step 1**: She opens the CosmoBot website in her browser.
- **Step 2**: She either **logs in / signs up**.
- **Step 3**: She goes to the **dashboard**, uploads a photo of a cosmetic product’s ingredient label.
- **Step 4**: The app sends that image to **Google Gemini**.
- **Step 5**: Gemini returns a JSON object with:
  - product name
  - brand
  - ingredients with hazard levels
  - a safety score and trust percentage
- **Step 6**: The app shows her a **visual report**: score, warnings, and recommendations.

The rest of this doc explains which files are involved and how React code moves data around.

---

### 2. Project layout (high level)

Important folders and files:

- **`index.html`**: Plain HTML file loaded by the browser. It contains a `<div id="root"></div>` where React will mount the app, and a `<script>` that loads the React entrypoint.
- **`src/main.tsx`**: The **entrypoint** for the React app. It finds the `root` div and renders the `<App />` component into it.
- **`src/App.tsx`**: The **top-level React component** (app shell). It handles:
  - checking if the user is logged in (via Firebase)
  - showing either the **auth screen** or the **dashboard**
  - rendering the navigation and footer.
- **`src/components/Auth.tsx`**: The **login / signup screen** UI.
- **`src/components/Dashboard.tsx`**: The **main feature UI** where the user uploads a photo and triggers analysis.
- **`src/components/AnalysisResult.tsx`**: The **results view** that displays the analysis (score, ingredients, warnings).
- **`src/services/geminiService.ts`**: A **service file** that calls the Gemini API and returns a typed `AnalysisResult`.
- **`src/lib/firebase.ts`**: A small **library/wrapper file** that initializes Firebase and exports the `auth` object.
- **`src/types/types.ts`**: Shared TypeScript **types** like `AnalysisResult` and `IngredientInfo`.
- **`vite.config.ts`** and **`tsconfig.json`**: Tooling configuration. Among other things, they set up the `@` path alias.

---

### 3. What is the `@` alias?

In this codebase, `@` is a **shortcut for the `src/` folder**.

- In `vite.config.ts`, there is:

```12:20:C:\Users\91808\Desktop\CosmeticAnalyzer\vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  }
}
```

- In `tsconfig.json`, there is:

```20:24:C:\Users\91808\Desktop\CosmeticAnalyzer\tsconfig.json
"paths": {
  "@/*": [
    "./src/*"
  ]
},
```

This means:

- `@/lib/firebase` → `src/lib/firebase.ts`
- `@/services/geminiService` → `src/services/geminiService.ts`
- `@/types/types` → `src/types/types.ts`

**Why it’s useful**: Instead of writing long relative paths like `../../services/geminiService`, you can use a clean, stable path that doesn’t break when folders move.

---

### 4. What is `lucide-react`?

`lucide-react` is a **React icon library**. It provides ready-made SVG icons as React components.

Example imports:

```7:8:C:\Users\91808\Desktop\CosmeticAnalyzer\src\App.tsx
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
```

You can then use them like JSX elements:

- `<Sparkles className="text-white w-6 h-6" />` in the navbar
- `<LogOut className="w-4 h-4" />` inside the Logout button

These are purely visual; they don’t manage state or logic.

---

### 5. Why is Firebase in `lib/`?

`lib` is short for **library**. In this project, `lib/` is used for **“connections” to external services**.

Firebase initialization lives in `src/lib/firebase.ts`:

```1:16:C:\Users\91808\Desktop\CosmeticAnalyzer\src\lib\firebase.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "cosmobot-9cde8.firebaseapp.com",
  projectId: "cosmobot-9cde8",
  storageBucket: "cosmobot-9cde8.firebasestorage.app",
  messagingSenderId: "477432229408",
  appId: "1:477432229408:web:4fcc318c2eb962838b9645",
  measurementId: "G-SJ9HFWZEMH"
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export default app;
```

Then other files **import the ready-to-use `auth` object**:

- In `App.tsx`:

```4:6:C:\Users\91808\Desktop\CosmeticAnalyzer\src\App.tsx
import { auth } from '@/lib/firebase';
import AuthScreen from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
```

- In `Auth.tsx`:

```4:5:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Auth.tsx
import { auth } from '@/lib/firebase';
import { Mail, Lock, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
```

**Why this is good**: all Firebase setup is in one place. If you ever change Firebase settings, you edit one file instead of hunting through components.

---

### 6. React + TypeScript basics (how the components are written)

React components here are **just functions that return JSX**.

#### 6.1. Entrypoint: `main.tsx`

```1:15:C:\Users\91808\Desktop\CosmeticAnalyzer\src\main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- `ReactDOM.createRoot(rootElement)` tells React **“control this part of the page”**.
- `<App />` is your top-level component.
- `<React.StrictMode>` is a development helper that can highlight issues; it doesn’t change the UI.

#### 6.2. `App.tsx`: decides between Auth and Dashboard

```1:12:C:\Users\91808\Desktop\CosmeticAnalyzer\src\App.tsx
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '@/lib/firebase';
import AuthScreen from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
```

Key parts:

- **State hooks**:

```9:12:C:\Users\91808\Desktop\CosmeticAnalyzer\src\App.tsx
const [user, setUser] = useState<firebase.User | null>(null);
const [loading, setLoading] = useState(true);
```

  - `useState` is how a component **remembers values between renders** (like “who is logged in?”).
  - `user` starts as `null`, meaning “not logged in yet”.

- **Effect hook to subscribe to auth changes**:

```13:19:C:\Users\91808\Desktop\CosmeticAnalyzer\src\App.tsx
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

  - `useEffect` runs after the component first renders.
  - `auth.onAuthStateChanged` is a Firebase function: it calls you when the user logs in or logs out.
  - When `currentUser` changes, React re-renders the component with the new `user` value.

- **Conditional rendering** (choose which UI to show):

```62:64:C:\Users\91808\Desktop\CosmeticAnalyzer\src\App.tsx
<main className="max-w-7xl mx-auto px-4 py-8">
  {!user ? <AuthScreen /> : <Dashboard />}
</main>
```

  - If `user` is `null`, show `<AuthScreen />`.
  - If `user` exists, show `<Dashboard />`.

#### 6.3. `Auth.tsx`: login and signup form

```7:12:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Auth.tsx
const [isLogin, setIsLogin] = useState(true);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
```

- These keep track of what the user typed in the form.

On form submit:

```13:25:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Auth.tsx
const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  try {
    if (isLogin) {
      await auth.signInWithEmailAndPassword(email, password);
    } else {
      await auth.createUserWithEmailAndPassword(email, password);
    }
  } catch (err: any) {
    setError(err.message);
  }
};
```

- `e.preventDefault()` stops the browser’s default form submission.
- `auth.signInWithEmailAndPassword` and `auth.createUserWithEmailAndPassword` come from Firebase.
- On success, Firebase will notify `App.tsx` via `onAuthStateChanged`, which flips the UI from Auth → Dashboard.

---

### 7. Data flow when a user scans a product

Here’s the **step-by-step flow with files**.

#### 7.1. From browser to React

1. **Browser loads HTML**
   - File: `index.html`
   - It has:
     - `div id="root"` (where the app mounts)
     - `<script type="module" src="/src/main.tsx"></script>`

2. **React bootstraps**
   - File: `src/main.tsx`
   - Renders `<App />` into `#root`.

#### 7.2. Auth vs Dashboard

3. **`App.tsx` listens to auth**
   - File: `src/App.tsx`
   - Uses Firebase `auth.onAuthStateChanged` to know if the user is logged in.
   - Decides between:
     - `<AuthScreen />` (not logged in)
     - `<Dashboard />` (logged in)

4. **If not logged in → `AuthScreen`**
   - File: `src/components/Auth.tsx`
   - User types email/password.
   - On submit, calls:
     - `auth.signInWithEmailAndPassword(email, password)` **or**
     - `auth.createUserWithEmailAndPassword(email, password)`
   - Firebase updates the auth state → `App.tsx` sees the user → shows `<Dashboard />`.

#### 7.3. Uploading an image and calling Gemini

5. **Dashboard renders upload UI**
   - File: `src/components/Dashboard.tsx`
   - State:

```7:12:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Dashboard.tsx
const [image, setImage] = useState<string | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [result, setResult] = useState<AnalysisResult | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

6. **User picks a file**
   - Handler:

```13:22:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Dashboard.tsx
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }
};
```

- `FileReader` turns the image into a **base64 data URL string** like `"data:image/jpeg;base64,AAAA..."`.
- That string gets stored in `image`.

7. **User clicks “Reveal Ingredients” → call Gemini**

```25:32:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Dashboard.tsx
const startAnalysis = async () => {
  if (!image) return;
  setIsAnalyzing(true);
  try {
    const base64Data = image.split(',')[1];
    const data = await analyzeCosmeticImage(base64Data);
    setResult(data);
  } catch (err) {
    console.error("Analysis failed", err);
    alert("Something went wrong during analysis. Please try a clearer image.");
  } finally {
    setIsAnalyzing(false);
  }
};
```

- `image.split(',')[1]` removes the `"data:image/jpeg;base64,"` prefix and keeps the raw base64.
- `analyzeCosmeticImage` is imported from the **service**:

```1:5:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Dashboard.tsx
import { Upload, Camera, FileText, Info, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { analyzeCosmeticImage } from '@/services/geminiService';
import { AnalysisResult } from '@/types/types';
import AnalysisResultView from './AnalysisResult';
```

#### 7.4. Inside the Gemini service

8. **Service builds prompt and calls Gemini**
   - File: `src/services/geminiService.ts`

```1:5:C:\Users\91808\Desktop\CosmeticAnalyzer\src\services\geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "@/types/types";

export const analyzeCosmeticImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
```

- It defines a long `prompt` string describing exactly what Gemini should return.
- It builds the client:

```46:52:C:\Users\91808\Desktop\CosmeticAnalyzer\src\services\geminiService.ts
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API Key not found. Please checks your .env file.");
}

const ai = new GoogleGenAI({ apiKey });
```

- It then calls `ai.models.generateContent(...)` with:
  - the base64 image
  - the text prompt
  - a JSON schema for the response.

9. **Service parses JSON and returns `AnalysisResult`**

```95:97:C:\Users\91808\Desktop\CosmeticAnalyzer\src\services\geminiService.ts
const text = response.text;
if (!text) throw new Error("No response from Gemini");
return JSON.parse(text.trim());
```

The shape of this JSON is described by the TypeScript type:

```8:17:C:\Users\91808\Desktop\CosmeticAnalyzer\src\types\types.ts
export interface AnalysisResult {
  productName: string;
  brand: string;
  overallSafetyScore: number;
  trustPercentage: number;
  ingredients: IngredientInfo[];
  toxicCompounds: string[];
  summary: string;
  recommendation: string;
}
```

This is what `Dashboard.tsx` expects as `data`.

#### 7.5. Showing the result

10. **Dashboard passes data to `AnalysisResultView`**

```174:176:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\Dashboard.tsx
  ) : (
    <AnalysisResultView data={result!} />
  )}
```

11. **`AnalysisResultView` renders charts and lists**
    - File: `src/components/AnalysisResult.tsx`

```11:18:C:\Users\91808\Desktop\CosmeticAnalyzer\src\components\AnalysisResult.tsx
interface Props {
  data: AnalysisResult;
}

const AnalysisResultView: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: "Score", value: data.overallSafetyScore },
    { name: "Remaining", value: 100 - data.overallSafetyScore },
  ];
```

- It uses `recharts` to draw a pie chart for the safety score.
- It uses `lucide-react` icons for visuals.
- It groups ingredients by `hazardLevel` and shows them in separate sections.

---

### 8. Summary of where each file is used

- **`src/main.tsx`**
  - Used by: `index.html` (via `<script src="/src/main.tsx">`)
  - Purpose: bootstraps React and renders `<App />`.

- **`src/App.tsx`**
  - Used by: `src/main.tsx`
  - Purpose: top-level layout, listens to Firebase auth, chooses between `AuthScreen` and `Dashboard`.

- **`src/lib/firebase.ts`**
  - Used by: `src/App.tsx`, `src/components/Auth.tsx`
  - Purpose: sets up Firebase and exports `auth`.

- **`src/components/Auth.tsx`**
  - Used by: `src/App.tsx`
  - Purpose: login/signup form and UI.

- **`src/components/Dashboard.tsx`**
  - Used by: `src/App.tsx`
  - Purpose: image upload UI, calls `analyzeCosmeticImage`, and shows the result component.

- **`src/services/geminiService.ts`**
  - Used by: `src/components/Dashboard.tsx`
  - Purpose: talk to Gemini API and return structured `AnalysisResult`.

- **`src/types/types.ts`**
  - Used by: `src/components/Dashboard.tsx`, `src/components/AnalysisResult.tsx`, `src/services/geminiService.ts`
  - Purpose: define TypeScript interfaces for analysis data.

- **`src/components/AnalysisResult.tsx`**
  - Used by: `src/components/Dashboard.tsx`
  - Purpose: display the analysis report (score, trust, toxic compounds, ingredient lists).

This should give you a clear mental map of how a user action travels through the files. Next, we can refactor the Gemini scoring or move the API call server-side, if you’d like to improve security and reliability.

