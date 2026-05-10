# Contributing to FalcoElectrec

First off, thank you for considering contributing to FalcoElectrec! 🦅⚡

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [ahmadsaqer818@gmail.com](mailto:ahmadsaqer818@gmail.com).

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/falcoelectrec.git
   cd falcoelectrec
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/falcoelectrec.git
   ```

---

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Seed database
python seed.py

# Start development server
flask run --port 5000
```

### Using Docker

```bash
docker-compose up -d
```

---

## Project Structure

```
falco/
├── src/                    # Frontend React application
│   ├── api/               # API client
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── state/             # State management
│   └── types/             # TypeScript types
├── backend/               # Flask backend
│   ├── app/
│   │   ├── api/          # API blueprints
│   │   ├── models/       # SQLAlchemy models
│   │   └── utils/        # Utilities
│   └── tests/            # Backend tests
├── docs/                  # Documentation
└── uploads/              # File uploads
```

---

## Coding Standards

### TypeScript/React

- Use **functional components** with hooks
- Use **TypeScript** for all new code
- Avoid `any` type - use proper typing
- Follow React hooks rules
- Use meaningful variable and function names

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
}

const UserCard: React.FC<UserProps> = ({ name, email }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};

// ❌ Bad
const UserCard = (props: any) => {
  return <div>{props.n}</div>;
};
```

### Python/Flask

- Follow **PEP 8** style guide
- Use **type hints** for function parameters
- Write **docstrings** for functions and classes
- Use **Black** for formatting
- Use **Ruff** for linting

```python
# ✅ Good
def calculate_commission(amount: float) -> float:
    """
    Calculate platform commission based on amount.
    
    Args:
        amount: Transaction amount in NIS
        
    Returns:
        Commission amount (0% for ≤700, 5% for >700)
    """
    if amount <= 700:
        return 0.0
    return amount * 0.05

# ❌ Bad
def calc(a):
    if a <= 700: return 0
    return a * 0.05
```

### CSS/Tailwind

- Use **Tailwind CSS** utility classes
- Keep custom CSS minimal
- Use consistent spacing and colors from design system

---

## Commit Guidelines

We follow the **Conventional Commits** specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
feat(auth): add password reset functionality
fix(api): handle null user in request endpoint
docs(readme): update installation instructions
test(auth): add unit tests for login flow
```

---

## Pull Request Process

1. **Create a branch** from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit following the guidelines

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request** against `develop` branch

5. **Fill out the PR template** with:
   - Description of changes
   - Related issue numbers
   - Screenshots (if UI changes)
   - Testing instructions

6. **Wait for review** and address any feedback

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Added/updated tests as needed
- [ ] Updated documentation as needed
- [ ] All tests pass locally
- [ ] No new linting errors

---

## Reporting Bugs

### Before Submitting

1. Check existing issues to avoid duplicates
2. Try to reproduce the bug on the latest version

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.19.0]
- Python: [e.g., 3.11.5]
```

---

## Suggesting Features

### Feature Request Template

```markdown
**Problem Statement**
Describe the problem this feature would solve.

**Proposed Solution**
Describe your proposed solution.

**Alternatives Considered**
Any alternative solutions you've considered.

**Additional Context**
Any other context, mockups, or examples.
```

---

## Questions?

Feel free to reach out:
- **Email**: ahmadsaqer818@gmail.com
- **GitHub Issues**: For bugs and features

---

Thank you for contributing! 🙏
