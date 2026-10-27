# BizLocate — MERN Stack Version

Industrial real-estate matching platform. Businesses describe what they need, owners list properties, an admin verifies them.

**Stack:** MongoDB · Express.js · React · Node.js, plus JWT (login), Multer (file upload), Mongoose, Tailwind CSS, Recharts.

The project is **two separate apps** that run in **two terminals**:

```
bizlocate-mer/n
├── server/     Express + Node + MongoDB + JWT + Multer     -> http://localhost:5000
└── client/     React (Vite) + Tailwind                     -> http://localhost:5173
```

---

## 1. What you need installed

| Tool | Check with | Get it |
|---|---|---|
| Node.js 18 or newer | `node -v` | https://nodejs.org (LTS) |
| MongoDB (local) | `mongosh --version` | https://www.mongodb.com/try/download/community |

MongoDB must be **running** on `mongodb://localhost:27017` (the default).
- Windows: it runs as a service after installation. Check "Services" -> MongoDB Server.
- Mac (Homebrew): `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

## 2. First-time setup

**Easy way:** double-click `install.bat` (Windows) or run `sh install.sh` (Mac/Linux). It runs `npm install` in both folders and creates the `.env` file.

**Manual way (what the script does):**
```bash
# --- backend ---
cd server
npm install                  # downloads the node_modules folder (all libraries listed in package.json)
copy .env.example .env       # Mac/Linux:  cp .env.example .env
npm run seed                 # fills MongoDB with demo users + the 6 original listings (run once)

# --- frontend ---
cd ../client
npm install
```

> `node_modules` is not inside the zip on purpose (it is hundreds of MB and depends on your computer). `npm install` rebuilds it from `package.json`.

## 3. Run it (two terminals)

```
Terminal 1                         Terminal 2
cd server                          cd client
npm run dev                        npm run dev
-> Server running on :5000         -> open http://localhost:5173
-> MongoDB connected
```

`npm run dev` in the server uses **nodemon**, which restarts the server every time you save a file.
Quick check: http://localhost:5000/api/health should show `{"status":"ok"}`.

## 4. Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@bizlocate.com | admin123 |
| Owner | owner1@bizlocate.com | owner123 |
| Owner | owner2@bizlocate.com | owner123 |
| Business | business@bizlocate.com | business123 |

`npm run seed` **empties** the users / properties / enquiries collections first, so only run it when you want a fresh start.
Nobody can sign up as admin on the website; the admin only comes from the seed script.

## 5. Features

| # | Feature | Where to see it |
|---|---|---|
| 1 | Signup / login with **JWT**, passwords hashed with bcrypt | `/signup`, `/login` |
| 2 | **Roles** (business / owner / admin) = authorization | try opening `/admin` as a business |
| 3 | **Multer**: several property photos + a private ownership PDF | `/owner-form` (log in as owner) |
| 4 | Photo gallery with thumbnails, arrows and full-screen view | any property page |
| 5 | **Admin verification** queue: view the PDF, Verify or Reject with a reason | `/admin` |
| 6 | Verified badge + **verified listings rank first** | `/listings` |
| 7 | Everything in **MongoDB**: listings, wishlist, enquiries, requirements | all pages |
| 8 | Business requirement form + **Match %** (area, budget, power, location) | `/business-form` then `/listings` |
| 9 | **Shareholders**: request a share, admin approves a % , rent split | open a property you own |
| 10 | **Analytics dashboard** (Recharts): views, enquiries, rent share | `/dashboard` (owner) |
| 11 | Admin stats + pie chart (MongoDB **aggregation**) | `/admin` |

Try this 3-minute demo: log in as **owner1** -> List Property (add photos + any PDF) -> log in as **admin** -> View document -> Verify -> log in as **business** -> open the property -> Request to become a Shareholder -> log in as **owner1** -> approve 25% -> see the rent split.

## 6. API (all start with `/api`)

| Method | URL | Who | What |
|---|---|---|---|
| POST | /auth/signup | anyone | create account (role business or owner) |
| POST | /auth/login | anyone | sets the JWT cookie, returns `{ user }` |
| POST | /auth/logout | anyone | deletes the cookie |
| GET | /auth/me | logged in | who am I |
| GET | /properties | anyone | public listings (verified first) |
| GET | /properties/mine | logged in | properties I own a share of |
| GET | /properties/:id | anyone | one property (counts a view) |
| POST | /properties | **owner** | create listing (multipart: photos + ownershipDoc) |
| DELETE | /properties/:id | owner of it / admin | delete + remove its files |
| GET | /properties/:id/document | owner of it / admin | the private PDF |
| GET | /properties/:id/payouts | shareholders / admin | rent split |
| GET | /admin/properties?status= | **admin** | verification queue |
| PATCH | /admin/properties/:id/verify | **admin** | `{decision, reason}` |
| GET | /admin/stats | **admin** | totals + aggregation |
| GET / POST | /wishlist, /wishlist/:propertyId | logged in | list / toggle |
| POST / GET | /enquiries | logged in | send / list mine |
| PATCH | /enquiries/:id/status | receiving owner | Responded / Scheduled |
| GET / PUT | /requirement | logged in | my business requirement |
| POST | /shares/:propertyId | logged in | request a share |
| GET | /shares/property/:propertyId | logged in | pending requests |
| PATCH | /shares/:requestId | property admin | approve (with %) / reject |
| GET | /analytics/me | logged in | my per-property numbers |

## 7. Folder map

```
server/
├── server.js            starts everything (loads .env, connects DB, listens)
├── app.js               creates the Express app, adds middleware, mounts routes
├── seed.js              demo data
├── config/db.js         mongoose.connect
├── models/              Schemas + Models: User, Property, Enquiry, Requirement, ShareRequest
├── routes/              URL -> controller (+ which middleware runs first)
├── controllers/         the real logic for each route
├── middleware/          auth.js (JWT + roles), upload.js (Multer), errorHandler.js
├── utils/               catchAsync.js, removeFiles.js (fs.unlink)
├── uploads/photos       public photos (served as static files)
├── uploads/docs         PRIVATE PDFs (never served directly)
└── demo/                small practice files that copy sir's notes (http, fs, path, modules, jwt, mongo shell)

client/src/
├── main.jsx, App.jsx    start-up and the route table
├── api.js               ONE fetch wrapper (adds the JWT header, handles FormData)
├── utils.js             calculateMatch, formatters
├── context/             Auth, Toast, Wishlist (shared state)
├── hooks/               useApi, useReveal, useCountUp
├── components/          Navbar, Footer, PropertyCard, Gallery, Modal, ProtectedRoute ...
└── pages/               Home, Login, Signup, Listings, PropertyDetail, forms, Profile, Dashboard, Admin
```

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection failed` / `ECONNREFUSED` | MongoDB is not running. Start it (section 1). If it still fails, change `localhost` to `127.0.0.1` in `server/.env`. |
| `Missing .env file` | Copy `server/.env.example` to `server/.env`. |
| Login says "Cannot reach the server" | The backend (terminal 1) is not running, or it uses another port. Match `VITE_API_URL` in `client/.env`. |
| Blocked by CORS | `CLIENT_URL` in `server/.env` must be exactly the address in your browser (`http://localhost:5173`). |
| `npm run seed` worked but pages are empty | Hard refresh the browser (Ctrl+Shift+R). |
| Login works but you are logged out on refresh, or "Please login first" | The JWT is stored in a cookie, so open the app at **http://localhost:5173** (not 127.0.0.1) and keep `CLIENT_URL=http://localhost:5173` in `server/.env`. The API URL must also use `localhost`. |
| Port 5000 busy (Mac AirPlay uses it) | Set `PORT=5001` in `server/.env` and `VITE_API_URL=http://localhost:5001` in `client/.env`. |

