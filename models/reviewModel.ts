import prisma from "../prisma";

// CREATE
export const createReview = (data: {
    rating: number;
    comment?: string;
    userId: number;
    productId: number;
}) => {
    return prisma.review.create({ data });
};

// READ
export const getReviewById = (id: number) => {
    return prisma.review.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const getProductReviews = (productId: number, skip = 0, take = 10) => {
    return prisma.review.findMany({
        where: { productId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
    });
};

export const getAllReviews = async (skip = 0, take = 10) => {
    return prisma.review.findMany({
        skip,
        take,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                }
            },
            product: {
                select: {
                    id: true,
                    name: true,
                    images: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// UPDATE
export const updateReview = (
    id: number,
    data: {
        rating?: number;
        comment?: string;
    }
) => {
    return prisma.review.update({
        where: { id },
        data,
    });
};

// DELETE
export const deleteReview = (id: number) => {
    return prisma.review.delete({
        where: { id },
    });
};