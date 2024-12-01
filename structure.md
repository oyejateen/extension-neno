graph TD
    A[Chrome Extension] --> B[Content Script]
    B --> C[Privacy Policy/TOS Detection]
    B --> D[Text Extraction]
    
    D --> E[Backend Server]
    E --> F[Gemini Nano API]
    F --> E
    
    E --> B
    B --> G[UI Overlay]
    G --> H[Summary Display]
    G --> I[Critical Points]
    
    subgraph Frontend
        A
        B
        C
        D
        G
        H
        I
    end
    
    subgraph Backend
        E
        F
    end