import {useEffect} from "react";
import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import type {LinksFunction} from "@remix-run/node";
import {
    Form,
    Links,
    Link,
    NavLink,
    Meta, Outlet,
    Scripts,
    ScrollRestoration, useLoaderData, useNavigation, useSubmit,
} from "@remix-run/react";
import appStylesHref from "./app.css?url";
import {createEmptyContact, getContacts} from "./data";


export const links: LinksFunction = () => [
    {rel: "stylesheet", href: appStylesHref},
];

export const loader = async ({
                                 request,
                             }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const contacts = await getContacts(q);
    return json({contacts, q});
};


export const action = async () => {
    const contact = await createEmptyContact();
    return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
    const {contacts, q} = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const searching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has(
            "q"
        );


    useEffect(() => {
        const searchField = document.getElementById("q");
        if (searchField instanceof HTMLInputElement) {
            searchField.value = q || "";
        }
    }, [q]);

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
            <title>App Note</title>
        </head>
        <body>
        <div id="sidebar">
            <h1>Remix Contacts</h1>
            <div>
                <Form id="search-form"
                      onChange={(event) => {
                          const isFirstSearch = q === null;
                          submit(event.currentTarget, {
                              replace: !isFirstSearch,
                          });
                      }} role="search">
                    <input
                        id="q"
                        aria-label="Search contacts"
                        className={
                            navigation.state === "loading" && !searching
                                ? "loading"
                                : ""
                        }
                        defaultValue={q || ""}
                        placeholder="Search"
                        type="search"
                        name="q"
                    />
                    <div id="search-spinner" aria-hidden hidden={true}/>
                </Form>
                <Form method="post">
                    <button type="submit">New</button>
                </Form>
            </div>
            <nav>
                {contacts.length ? (
                    <ul>
                        {contacts.map((contact) => (
                            <li key={contact.id}>
                                <NavLink
                                    className={({isActive, isPending}) =>
                                        isActive
                                            ? "active"
                                            : isPending
                                                ? "pending"
                                                : ""
                                    }
                                    to={`contacts/${contact.id}`}
                                >
                                    <Link to={`contacts/${contact.id}`}>
                                        {contact.first || contact.last ? (
                                            <>
                                                {contact.first} {contact.last}
                                            </>
                                        ) : (
                                            <i>No Name</i>
                                        )}{" "}
                                        {contact.favorite ? (
                                            <span>★</span>
                                        ) : null}
                                    </Link>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>
                        <i>No contacts</i>
                    </p>
                )}
            </nav>
        </div>
        <div className={
            navigation.state === "loading" ? "loading" : ""
        } id="detail">
            <Outlet/>
        </div>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}
