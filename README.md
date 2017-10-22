# Requirements

Ensure you have downloaded and installed the appropriate versions of the following for your operating system:

- [Node](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/en/docs/install)

# Set up

In terminal or command prompt:

- Move into the directory of this script e.g. `cd ./mum-doc-search`
- Bootstrap the script by running `yarn install`

This only needs to be done **once** and then you can [search for phrases](#search-for-phrases) as many times as you like.

# Search for phrases

When you are in the directory for this script, you can search for a phrase by entering the following command:

`yarn search <path> '<phrase>' <destination>`

For example:

`yarn search ./my-documents 'chimney' ../../phrases`