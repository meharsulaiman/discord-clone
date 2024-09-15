'use client';

import axios from 'axios';
import * as z from 'zod';
import qs from 'query-string';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import React from 'react';
import { DialogDescription, DialogFooter, DialogHeader } from '../ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Button } from '../ui/button';
import FileUpload from '../file-upload';
import { useRouter } from 'next/navigation';
import { useModal } from '@/hooks/use-modal-store';

const formSchema = z.object({
  fileUrl: z.string().url({
    message: 'Attachment is required.',
  }),
});

export const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { apiUrl, query } = data;
  const router = useRouter();

  const isModalOpen = isOpen && type === 'messageFile';

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: '',
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const url = qs.stringifyUrl({
      url: apiUrl || '',
      query,
    });
    try {
      await axios.post(url, {
        ...values,
        content: values.fileUrl,
      });

      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='bg-white text-black p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-center text-2xl font-bold'>
            Add an attachment
          </DialogTitle>
          <DialogDescription className='text-center text-zinc-500'>
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-8 px-6'>
              <div className='flex items-center justify-center text-center'>
                <FormField
                  control={form.control}
                  name='fileUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint='messageFile'
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className='bg-gray-100 px-6 py-4'>
              <Button disabled={isLoading} variant={'primary'}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
