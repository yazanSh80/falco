# Request Lifecycle Diagrams

This document provides detailed flow diagrams for the FalcoElectrec service request lifecycle.

---

## Request Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Customer creates request
    
    Pending --> Accepted: Engineer accepts
    Pending --> Cancelled: Customer cancels
    Pending --> Expired: No response (SLA breach)
    
    Accepted --> InProgress: Engineer starts work
    Accepted --> Cancelled: Either party cancels
    
    InProgress --> Completed: Engineer marks done
    InProgress --> Disputed: Issue raised
    
    Completed --> Reviewed: Customer leaves review
    Completed --> Disputed: Post-completion issue
    
    Disputed --> Resolved: Admin resolves
    Resolved --> [*]
    
    Reviewed --> [*]
    Cancelled --> [*]
    Expired --> [*]
```

---

## Quick Request Flow (2h Response SLA)

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant E as Engineer
    participant A as Admin
    
    C->>S: Create Quick Request
    S->>S: Set SLA Deadlines<br/>(Response: 2h, Complete: 24h)
    S->>E: Push Notification<br/>"New Quick Request"
    
    alt Engineer responds within 2h
        E->>S: Accept Request
        S->>C: Notification "Request Accepted"
        S->>S: Update status → ACCEPTED
        
        E->>S: Start Work
        S->>S: Update status → IN_PROGRESS
        
        alt Completed within 24h
            E->>S: Mark Complete
            S->>C: Notification "Request Completed"
            S->>S: Create Transaction
            C->>S: Submit Review
        else Completion SLA Breached
            S->>A: Alert "SLA Breached"
            S->>S: Flag for admin review
        end
    else No response in 2h
        S->>S: Flag as AT_RISK
        S->>A: Alert "SLA At Risk"
        S->>E: Urgent Reminder
    end
```

---

## Late Request Flow (24h Response SLA)

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant E as Engineer
    
    C->>S: Create Late Request
    S->>S: Set SLA Deadlines<br/>(Response: 24h, Complete: 72h)
    S->>S: Add to Available Requests
    
    loop Check periodically
        E->>S: Browse Available Requests
        S->>E: Show matching requests
    end
    
    E->>S: Accept Request
    S->>C: Notification
    S->>S: ACCEPTED
    
    Note over E,S: Work performed
    
    E->>S: Complete Request
    S->>S: Calculate commission
    S->>S: Create Transaction
    S->>C: Request completion notification
```

---

## Engineer Recommendation Flow

```mermaid
flowchart TB
    Start[Customer Creates Request] --> Parse[Parse Request Details]
    Parse --> Extract[Extract Category & Location]
    
    Extract --> Query[Query Available Engineers]
    Query --> Filter1{Active Subscription?}
    
    Filter1 -->|No| Exclude1[Exclude]
    Filter1 -->|Yes| Filter2{Matching Specialization?}
    
    Filter2 -->|No| Exclude2[Exclude]
    Filter2 -->|Yes| Filter3{In Service Area?}
    
    Filter3 -->|No| LowerScore[Lower Priority]
    Filter3 -->|Yes| Score[Calculate Score]
    
    Score --> Rating[Rating Weight: 40%]
    Score --> Experience[Experience Weight: 30%]
    Score --> Completed[Completed Jobs: 20%]
    Score --> Response[Response Time: 10%]
    
    Rating --> Combine[Combine Scores]
    Experience --> Combine
    Completed --> Combine
    Response --> Combine
    LowerScore --> Combine
    
    Combine --> Sort[Sort by Score DESC]
    Sort --> Top5[Return Top 5 Engineers]
    Top5 --> Display[Display to Customer]
```

---

## SLA Monitoring Process

```mermaid
flowchart LR
    subgraph "SLA Configuration"
        Q[Quick Request]
        L[Late Request]
    end
    
    subgraph "Deadlines"
        Q --> QR[Response: 2h]
        Q --> QC[Complete: 24h]
        L --> LR[Response: 24h]
        L --> LC[Complete: 72h]
    end
    
    subgraph "Status Check"
        QR --> Check{Time Remaining}
        QC --> Check
        LR --> Check
        LC --> Check
    end
    
    Check -->|> 20%| Green[✅ On Track]
    Check -->|< 20%| Yellow[⚠️ At Risk]
    Check -->|Expired| Red[❌ Breached]
    
    Yellow --> Alert[Admin Alert]
    Red --> Alert
    Red --> Log[Audit Log]
```

---

## Dispute Resolution Flow

```mermaid
flowchart TB
    Start[Issue Occurs] --> Raise[Customer/Engineer<br/>Raises Dispute]
    Raise --> Create[Create Dispute Record]
    Create --> Notify[Notify All Parties]
    
    Notify --> Queue[Add to Admin Queue]
    Queue --> Review[Admin Reviews]
    
    Review --> Evidence[Review Evidence]
    Evidence --> Decision{Decision}
    
    Decision -->|Favor Customer| RefundCustomer[Process Refund]
    Decision -->|Favor Engineer| PayEngineer[Release Payment]
    Decision -->|Dismiss| NoAction[No Action Needed]
    
    RefundCustomer --> Log[Log Resolution]
    PayEngineer --> Log
    NoAction --> Log
    
    Log --> NotifyResult[Notify Parties<br/>of Decision]
    NotifyResult --> Close[Close Dispute]
```

---

## Payment/Transaction Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant E as Engineer
    participant A as Admin
    
    Note over C,S: Request Completed
    
    S->>S: Get Request Price
    S->>S: Calculate Commission (15%)
    S->>S: Calculate Net Amount
    
    S->>S: Create Transaction Record
    Note right of S: gross_amount<br/>commission_rate<br/>commission_amount<br/>net_amount
    
    S->>C: Payment Receipt
    S->>E: Earnings Update
    S->>A: Finance Dashboard Update
    
    Note over A: Admin can view:
    Note over A: - Total Revenue
    Note over A: - Commission Earned
    Note over A: - Engineer Payouts
    Note over A: - CSV Export
```

---

## Block List Flow

```mermaid
flowchart TB
    subgraph "Customer Blocking Engineer"
        C1[Customer views engineer] --> Block1[Click Block]
        Block1 --> Reason1[Optional: Add Reason]
        Reason1 --> Save1[Save Block Record]
        Save1 --> Effect1[Engineer hidden from<br/>customer's view]
    end
    
    subgraph "Engineer Blocking Customer"
        E1[Engineer views request] --> Block2[Block Customer]
        Block2 --> Reason2[Optional: Add Reason]
        Reason2 --> Save2[Save Block Record]
        Save2 --> Effect2[Customer's requests<br/>not shown to engineer]
    end
    
    subgraph "Impact"
        Effect1 --> NoMatch[No matching<br/>in recommendations]
        Effect2 --> NoMatch
    end
```

---

## Review System Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant E as Engineer
    
    Note over C,S: Request marked COMPLETED
    
    S->>C: Prompt for Review
    C->>S: Submit Rating (1-5) + Text
    
    S->>S: Validate Review
    S->>S: Save Review
    
    S->>S: Recalculate Engineer Rating
    Note right of S: rating_avg = SUM(ratings) / COUNT<br/>rating_count++
    
    S->>E: Notification "New Review"
    S->>S: Update Engineer Profile
```

---

## Notification System

```mermaid
flowchart LR
    subgraph "Triggers"
        T1[Request Created]
        T2[Request Accepted]
        T3[Request Completed]
        T4[Review Received]
        T5[Dispute Raised]
        T6[Subscription Expiring]
    end
    
    subgraph "Processing"
        Create[Create Notification]
        Target[Determine Target User]
        Template[Select Template]
    end
    
    subgraph "Delivery"
        Save[Save to Database]
        Push[Push to Frontend]
        Badge[Update Badge Count]
    end
    
    T1 --> Create
    T2 --> Create
    T3 --> Create
    T4 --> Create
    T5 --> Create
    T6 --> Create
    
    Create --> Target
    Target --> Template
    Template --> Save
    Save --> Push
    Push --> Badge
```

---

## Admin Dashboard Data Flow

```mermaid
flowchart TB
    subgraph "Data Sources"
        Users[(Users Table)]
        Requests[(Requests Table)]
        Transactions[(Transactions Table)]
        Reviews[(Reviews Table)]
        Disputes[(Disputes Table)]
    end
    
    subgraph "Aggregations"
        A1[Count Active Users]
        A2[Count Pending Requests]
        A3[Sum Total Revenue]
        A4[Avg Engineer Rating]
        A5[Count Open Disputes]
    end
    
    subgraph "Dashboard Cards"
        K1[Total Users KPI]
        K2[Active Requests KPI]
        K3[Revenue KPI]
        K4[Avg Rating KPI]
        K5[Disputes KPI]
    end
    
    subgraph "Charts"
        C1[Revenue Over Time]
        C2[Requests by Category]
        C3[User Growth]
    end
    
    Users --> A1 --> K1
    Requests --> A2 --> K2
    Transactions --> A3 --> K3
    Reviews --> A4 --> K4
    Disputes --> A5 --> K5
    
    Transactions --> C1
    Requests --> C2
    Users --> C3
```

---

*These diagrams can be rendered in VS Code with the "Markdown Preview Mermaid Support" extension or on GitHub.*
