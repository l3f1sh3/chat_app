# Slack Chat API

Kompletné Backend API pre chatting aplikáciu typu Slack. Postavené na **Elysia** frameworku s **Prisma ORM** a **PostgreSQL** databázou.

## Technológie

- **Runtime:** Bun
- **Framework:** Elysia 🦊
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (Access & Refresh Tokens)
- **Password Hashing:** bcrypt (12 rounds)
- **Token Security:** SHA-256 hash pre refresh tokeny

## Funkcie

### Autentifikácia
- Registrácia s emailom a heslom
- Prihlásenie s JWT access & refresh tokenmi
- Odhlásenie (invalidácia refresh tokenu)
- Refresh endpoint pre obnovenie access tokenu
- Zobrazenie profilu prihláseného používateľa
- Vyhľadávanie ostatných používateľov
- JWT tokeny s claims: sub, userId, email, name, exp

### Konverzácie
- Vytvorenie 1-na-1 konverzácie
- Vytvorenie skupinových chatov
- Automatické generovanie default názvu (meno druhého usera pre 1-na-1, zoznam mien pre skupiny)
- Možnosť zmeny názvu konverzácie
- Pridávanie/odstraňovanie účastníkov
- Zoznam všetkých konverzácií používateľa

### Správy
- Posielanie textových správ
- Odpovedanie na správy (reply feature)
- Zobrazenie histórie správ v konverzácii

### Reakcie
- Pridávanie emoji reakcií na správy
- Každý používateľ môže mať jednu reakciu na správu
- Zmena reakcie (automatický update)
- Odstránenie reakcie
- 77 dostupných emoji

### Pagination
- **Cursor-based pagination** pre správy v konverzáciách
- Optimalizované pre real-time chat aplikácie
- Konzistentné výsledky aj pri novo pridaných správach
- Konfigurovateľný limit (1-100, default: 50)
- Správy zoradené od najnovších po najstaršie

### Bezpečnosť
- Všetky chat endpointy vyžadujú autentifikáciu
- Kontrola prístupu ku konverzáciám (iba účastníci)
- Input validácia na všetkých endpointoch
- Hashované heslá (bcrypt)
- Token-based sessions
- DTO pattern (nevracia citlivé údaje)

## Setup

### 1. Inštalácia závislostí

```bash
bun install
```

### 2. Konfigurácia databázy a JWT

Vytvorte `.env` súbor v root priečinku:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/Clasmate?schema=public"

# JWT Secrets (v produkcii použite silné, náhodné reťazce)
ACCESS_TOKEN_SECRET="your-access-token-secret-change-in-production"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-change-in-production"
```

**Dôležité:** V produkcii vygenerujte silné, náhodné secret keys:
```bash
# Príklad generovania náhodných secretov
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Synchronizácia databázy

```bash
bun run db:push
bun run db:generate
```

### 4. Seed emojis (77 emojis)

```bash
bun run db:seed
```

### 5. Spustenie servera

```bash
bun run dev
# alebo
bun src/index.ts
```

Server beží na: `http://localhost:3000` 🦊

## API Endpoints

### Authentication (`/auth`)

| Endpoint | Method | Auth | Popis |
|----------|--------|------|-------|
| `/auth/register` | POST | No | Registrácia nového používateľa |
| `/auth/login` | POST | No | Prihlásenie používateľa |
| `/auth/refresh` | POST | No | Obnovenie access tokenu pomocou refresh tokenu |
| `/auth/logout` | POST | Yes | Odhlásenie (invalidácia refresh tokenu) |
| `/auth/profile` | GET | Yes | Profil prihláseného používateľa |
| `/auth/users?search=text` | GET | Yes | Vyhľadávanie používateľov |

#### Register/Login Request:
```json
{
  "email": "alice@example.com",
  "password": "password123",
  "name": "Alice"
}
```

#### Register/Login Response:
```json
{
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

#### Refresh Token Request:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Refresh Token Response:
```json
{
  "user": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### Conversations (`/chat/conversations`)

| Endpoint | Method | Auth | Popis |
|----------|--------|------|-------|
| `/chat/conversations` | POST | Yes | Vytvorenie konverzácie |
| `/chat/conversations` | GET | Yes | Zoznam všetkých konverzácií |
| `/chat/conversations/:id` | GET | Yes | Detail konverzácie |
| `/chat/conversations/:id` | PATCH | Yes | Zmena názvu konverzácie |
| `/chat/conversations/:id/participants` | POST | Yes | Pridanie účastníka |
| `/chat/conversations/:id/participants/:userId` | DELETE | Yes | Odstránenie účastníka |

#### Create Conversation (1-on-1):
```json
{
  "participantIds": [2]
}
```

#### Create Conversation (group):
```json
{
  "participantIds": [2, 3, 4]
}
```

#### Update Conversation Name:
```json
{
  "name": "Project Discussion"
}
```

### Messages (`/chat/conversations/:id/messages`)

| Endpoint | Method | Auth | Popis |
|----------|--------|------|-------|
| `/chat/conversations/:id/messages` | POST | Yes | Poslanie správy |
| `/chat/conversations/:id/messages` | GET | Yes | Zobrazenie správ s pagination |

#### Send Message:
```json
{
  "content": "Hello everyone!"
}
```

#### Send Reply:
```json
{
  "content": "I agree!",
  "replyToId": 5
}
```

#### Get Messages (s pagination):
```
GET /chat/conversations/:id/messages?limit=20&cursor=123
```

**Query parametry:**
- `limit` (optional): Počet správ na stránku (1-100, default: 50)
- `cursor` (optional): ID správy pre ďalšiu stránku

**Response:**
```json
{
  "data": [
    {
      "id": 125,
      "content": "Latest message",
      "author": { "id": 1, "name": "Alice", "email": "alice@example.com" },
      "replyTo": null,
      "reactions": [],
      "createdAt": "2024-01-15T10:30:00Z"
    },
    ...
  ],
  "pagination": {
    "nextCursor": "105",
    "hasMore": true,
    "limit": 20
  }
}
```

**Poznámky:**
- Správy sú zoradené od **najnovších po najstaršie** (DESC)
- `nextCursor` je `null` ak neexistujú ďalšie správy
- Pre načítanie starších správ použite `cursor` z predchádzajúcej odpovede
- Cursor-based pagination zaručuje konzistentné výsledky aj pri real-time správach

### Reactions

| Endpoint | Method | Auth | Popis |
|----------|--------|------|-------|
| `/chat/messages/:id/reactions` | POST | Yes | Pridanie/zmena reakcie |
| `/chat/reactions/:id` | DELETE | Yes | Odstránenie konkrétnej reakcie (len vlastnej) |

#### Add/Update Reaction:
```json
{
  "emojiId": 1
}
```

**Poznámka:** Každý používateľ môže mať max 1 reakciu na správu. Ak už reakciu má, automaticky sa zmení (upsert).

#### Delete Reaction:
```
DELETE /chat/reactions/:reactionId
```

**Bezpečnosť:**
- Používateľ môže vymazať **len svoju vlastnú reakciu**
- Vymaže sa **vždy len jedna konkrétna reakcia** (podľa ID)
- Pokus o vymazanie cudzej reakcie vráti chybu: "You can only delete your own reactions"

### Emojis (`/chat/emojis`)

| Endpoint | Method | Auth | Popis |
|----------|--------|------|-------|
| `/chat/emojis` | GET | Yes | Zoznam všetkých dostupných emojis |

## Autentifikácia

### JWT Access & Refresh Tokens

API používa **JWT (JSON Web Tokens)** s dvojitým token systémom pre maximálnu bezpečnosť:

#### Access Token
- **Typ:** JWT (JSON Web Token)
- **Expirácia:** 15 minút
- **Použitie:** Autentifikácia API requestov
- **Claims:** 
  - `sub`: User ID (string)
  - `userId`: User ID (number)
  - `email`: User email
  - `name`: User name
  - `iat`: Issued at (timestamp)
  - `exp`: Expiration (timestamp)

#### Refresh Token
- **Typ:** JWT (JSON Web Token)
- **Expirácia:** 7 dní
- **Použitie:** Obnovenie access tokenu
- **Uloženie:** Hash (SHA-256) v databáze
- **Rotácia:** Pri každom refresh sa generuje nový pár tokenov

### Ako používať tokeny

**1. Registrácia/Login:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"User"}'
```

**Response obsahuje oba tokeny:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

**2. Použitie Access Tokenu:**
```bash
curl -H "Authorization: Bearer <accessToken>" \
     http://localhost:3000/auth/profile
```

**3. Obnovenie Access Tokenu:**
Keď access token expiruje (po 15 min), použite refresh token:
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

**4. Logout:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

### Bezpečnostné vlastnosti

✅ **Krátka expirácia access tokenu** (15 min) - minimalizuje riziko pri úniku  
✅ **Dlhá expirácia refresh tokenu** (7 dní) - pohodlné pre používateľa  
✅ **Refresh token hash v DB** - aj pri úniku DB nie je priamo použiteľný  
✅ **Token rotation** - každý refresh generuje nový pár tokenov  
✅ **Logout invaliduje refresh token** - okamžité odpojenie  
✅ **JWT signed tokens** - nemožno zmieniť bez secret key  

### Príklad (curl):
   ```bash
curl -H "Authorization: Bearer 08umLUtivoaJzhif31fgNnb5FtnNVg" \
     http://localhost:3000/auth/profile
```

### Príklad (JavaScript):
```javascript
fetch('http://localhost:3000/chat/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Databázová schéma

### User
- Autentifikácia používateľov
- Email (unique), name, password (bcrypt hashed)
- RefreshTokenHash (nullable, unique) - SHA-256 hash JWT refresh tokenu
- Access token v JWT formáte (nie v DB, iba signed)
- Refresh token hash pre sessions (7 dní)

### Conversation
- Konverzácie medzi používateľmi
- Voliteľný vlastný názov
- Default názov generovaný automaticky

### ConversationParticipant (Many-to-Many)
- Prepojenie User ↔ Conversation
- Jeden user môže byť v mnohých konverzáciách
- Jedna konverzácia môže mať mnohých účastníkov
- Unique constraint (userId, conversationId)

### Message
- Správy v konverzáciách
- Self-referential relation pre replies (replyToId)
- Cascade delete pri vymazaní konverzácie

### Reaction
- Reakcie používateľov na správy
- Každý user môže mať max 1 reakciu na správu
- Unique constraint (messageId, userId)
- Upsert logika (update or create)

### Emoji
- 77 predefinovaných emojis
- Symbol (👍) a name (thumbs_up)

## Štruktúra projektu

```
src/
├── index.ts                      # Main app s global error handler
├── database.ts                   # Prisma Client instance
├── modules/
│   ├── auth/
│   │   ├── index.ts              # Auth endpoints
│   │   ├── model.ts              # Validation schemas
│   │   ├── dto/
│   │   │   └── user.ts           # User DTO
│   │   └── middlewares/
│   │       └── authenticate.ts   # Auth middleware
│   └── chat/
│       ├── index.ts              # Chat endpoints
│       ├── model.ts              # Validation schemas
│       ├── dto/
│       │   ├── conversation.ts   # Conversation DTO
│       │   ├── message.ts        # Message DTO
│       │   └── reaction.ts       # Reaction DTO
│       └── middlewares/
│           └── conversationAccess.ts
└── utils/
    ├── generateToken.ts          # Token generation (30 chars)
    └── conversationName.ts       # Default name logic
prisma/
├── schema.prisma                 # Database schema
└── seed.ts                       # Emoji seed script
```

## Default Conversation Names

API automaticky generuje názvy konverzácií:

### 1-na-1 konverzácia
Každý používateľ vidí **meno druhého používateľa**:
- Alice vidí: "Bob"
- Bob vidí: "Alice"

### Skupinová konverzácia
Každý používateľ vidí **mená ostatných účastníkov** (max 3):
- Alice vidí: "Bob, Charlie, David"
- Bob vidí: "Alice, Charlie, David"

Názov je možné zmeniť cez `PATCH /chat/conversations/:id`.

## Validácie

### Register:
- Email: must be valid email format
- Password: min 6 znakov
- Name: min 2 znaky

### Create Conversation:
- participantIds: min 1, max 50 účastníkov

### Send Message:
- content: min 1 znak, max 5000 znakov

### Validation Error Response:
```json
{
  "status": "error",
  "type": "validation",
  "errors": [
    {
      "property": "Expected string length greater or equal to 6",
      "message": "Expected string length greater or equal to 6"
    }
  ]
}
```

## Security Features

### Access Control
- Neprihlásený používateľ nemôže pristúpiť k chat endpointom
- Používateľ môže pristupovať iba ku konverzáciám, v ktorých je účastník
- Reakcie možné iba na správy v dostupných konverzáciách
- **Používateľ môže vymazať len svoje vlastné reakcie** (nie cudzie)
- Vymazanie reakcie je vždy po jednej (nie hromadné)
- Reply možný iba na správy v tej istej konverzácii

### Data Protection
- Heslá hashované s bcrypt (12 rounds)
- **JWT Access Token:** 15 min expirácia, signed, nie v DB
- **JWT Refresh Token:** 7 dní expirácia, hash v DB (SHA-256)
- **Access token obsahuje:** sub, userId, email, name, iat, exp
- **Refresh token rotation:** nový pár pri každom refresh
- DTO pattern - nevracia password ani refreshTokenHash v listoch
- RefreshTokenHash nullable - po logout je null

### Validation
- Input validation na všetkých endpointoch
- Type checking (TypeScript + Elysia)
- Unique constraints v databáze
- Email format validation

## NPM Scripts

   ```bash
bun run dev          # Dev server s auto-reload
bun run start        # Production server
bun run db:generate  # Generuje Prisma Client
bun run db:push      # Synchronizuje schema s DB
bun run db:migrate   # Vytvorí migrácie
bun run db:studio    # Otvorí Prisma Studio GUI
bun run db:seed      # Seed emojis do DB
```

## Testovanie

### Postman / Insomnia

1. **Register:** POST `/auth/register`
2. **Login:** POST `/auth/login` → získaj token
3. **Search Users:** GET `/auth/users` s Authorization headerom
4. **Create Conversation:** POST `/chat/conversations` s participantIds
5. **Send Message:** POST `/chat/conversations/:id/messages`
6. **Add Reaction:** POST `/chat/messages/:id/reactions`
7. **List Conversations:** GET `/chat/conversations`
8. **Get Messages:** GET `/chat/conversations/:id/messages`

### Príklad Flow:

   ```bash
# 1. Register Alice
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"pass123","name":"Alice"}'

# 2. Register Bob
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"pass123","name":"Bob"}'

# 3. Alice creates conversation with Bob (userId=2)
curl -X POST http://localhost:3000/chat/conversations \
  -H "Authorization: Bearer <alice_token>" \
  -H "Content-Type: application/json" \
  -d '{"participantIds":[2]}'

# 4. Alice sends message
curl -X POST http://localhost:3000/chat/conversations/1/messages \
  -H "Authorization: Bearer <alice_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello Bob!"}'

# 5. Bob replies
curl -X POST http://localhost:3000/chat/conversations/1/messages \
  -H "Authorization: Bearer <bob_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hi Alice!","replyToId":1}'

# 6. Bob adds reaction (response vracia reactionId v message objektu)
curl -X POST http://localhost:3000/chat/messages/1/reactions \
  -H "Authorization: Bearer <bob_token>" \
  -H "Content-Type: application/json" \
  -d '{"emojiId":1}'

# 6b. Bob removes his reaction (musí vedieť reactionId)
curl -X DELETE http://localhost:3000/chat/reactions/1 \
  -H "Authorization: Bearer <bob_token>"

# 7. Get messages with pagination
curl "http://localhost:3000/chat/conversations/1/messages?limit=20" \
  -H "Authorization: Bearer <alice_token>"

# 8. Get next page (use nextCursor from previous response)
curl "http://localhost:3000/chat/conversations/1/messages?limit=20&cursor=15" \
  -H "Authorization: Bearer <alice_token>"
```

## Relations Diagram

```
User (1) ←→ (*) ConversationParticipant (*) ←→ (1) Conversation
User (1) ←→ (*) Message (*) ←→ (1) Conversation
User (1) ←→ (*) Reaction (*) ←→ (1) Message
Message (1) ←→ (*) Message (self-referential reply)
Emoji (1) ←→ (*) Reaction
```

## Error Handling

### Global Validation Errors
```json
{
  "status": "error",
  "type": "validation",
  "errors": [...]
}
```

### Custom Errors
```json
{
  "status": "error",
  "message": "User already exists"
}
```

### Unauthorized
```
Unauthorized
```

### Access Denied
```json
{
  "status": "error",
  "message": "Access denied"
}
```

## Development

1. Úprava modelov v `prisma/schema.prisma`
2. `bun run db:push` pre sync
3. `bun run db:generate` pre nové Prisma typy
4. Reštart servera (`bun run dev`)

## Ďalšie zdroje

- [Elysia Documentation](https://elysiajs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Bun Documentation](https://bun.sh)